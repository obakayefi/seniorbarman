import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Ticket from "@/models/Ticket";
import EventApplication from "@/models/EventApplication";
import User from "@/models/User";
import { getUserFromCookie } from "@/lib/auth";
import { ROLES, ROLE_GROUPS } from "@/lib/roles";
import { hasManagerAccessToTeams } from "@/services/teamService";

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await getUserFromCookie();

        // Explicitly reference User to prevent tree-shaking
        if (User) {
            console.log("User model registered: ", User.modelName);
        }

        if (!user || !ROLE_GROUPS.CAN_CREATE_EVENT.includes(user.role as any)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Fetch event details
        const event = await Event.findById(id)
            .populate('homeTeam', 'name logo')
            .populate('awayTeam', 'name logo')
            .lean() as any;
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Restrict organizers and team managers to their own/managed events
        if (user.role === ROLES.ORGANIZER && event.createdBy?.toString() !== user.id) {
            return NextResponse.json({ error: "Forbidden: You can only view events you created" }, { status: 403 });
        }

        if (user.role === ROLES.TEAM_MANAGER) {
            const isCreator = event.createdBy?.toString() === user.id;
            const isManagerOfTeams = await hasManagerAccessToTeams(user.id, [event.homeTeam?._id?.toString(), event.awayTeam?._id?.toString()]);
            if (!isCreator && !isManagerOfTeams) {
                return NextResponse.json({ error: "Forbidden: You can only view events for your managed teams" }, { status: 403 });
            }
        }

        // Fetch all tickets for this event
        const tickets = await Ticket.find({ event: id })
            .populate('createdBy', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .lean();

        // Calculate ticket statistics
        const totalTickets = tickets.length;
        const totalRevenue = tickets.reduce((sum, t) => sum + (t.price || 0), 0);

        // Count by stand/category
        const categoryBreakdown: Record<string, number> = {};
        let checkedInCount = 0;

        tickets.forEach(ticket => {
            const stand = ticket.stand || "Regular";
            categoryBreakdown[stand] = (categoryBreakdown[stand] || 0) + 1;

            if (ticket.checkInLogs && ticket.checkInLogs.length > 0) {
                if (ticket.isInside) checkedInCount++;
            }
        });

        const stats = {
            totalTickets,
            totalRevenue,
            checkedInCount,
            checkInRate: totalTickets > 0 ? (checkedInCount / totalTickets) * 100 : 0,
            categoryBreakdown: Object.entries(categoryBreakdown).map(([name, count]) => ({
                name,
                count,
                revenue: tickets.filter(t => (t.stand || "Regular") === name).reduce((s, t) => s + (t.price || 0), 0)
            }))
        };

        // ── Application revenue stats (only relevant for events with applicationFee) ──
        let appStats = null;
        if (event.requiresApplication) {
            const applications = await EventApplication.find({ event: id })
                .populate('user', 'firstName lastName email createdAt')
                .sort({ createdAt: -1 })
                .lean() as any[];

            // Force cast to number to avoid NaN/string concat bugs
            const applicationFee = Number(event.applicationFee) || 0;
            const paidApps = applications.filter((a: any) => a.paymentStatus === 'paid');
            const freeApps = applications.filter((a: any) => a.paymentStatus === 'free');
            const unpaidApps = applications.filter((a: any) => a.paymentStatus === 'unpaid');

            // Sum actual amountPaid per application.
            // Fall back to event.applicationFee for legacy records created before amountPaid was tracked.
            const applicationRevenue = paidApps.reduce((sum: number, a: any) => {
                const amountPaid = Number(a.amountPaid) || 0;
                const paid = amountPaid > 0 ? amountPaid : applicationFee;
                return sum + paid;
            }, 0);

            appStats = {
                totalApplications: applications.length,
                paidCount: paidApps.length,
                freeCount: freeApps.length,
                unpaidCount: unpaidApps.length,
                applicationFee,
                applicationRevenue,
                // Pass through applications for the table
                applications,
            };
        }

        return NextResponse.json({
            success: true,
            event,
            tickets,
            stats,
            appStats,
        }, { status: 200 });

    } catch (error: any) {
        console.error("Event detail fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch event statistics: " + error.message },
            { status: 500 }
        );
    }
}

