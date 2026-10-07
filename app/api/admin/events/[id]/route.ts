import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Ticket from "@/models/Ticket";
import TicketOrder from "@/models/TicketOrder";
import EventApplication from "@/models/EventApplication";
import User from "@/models/User";
import { getUserFromCookie } from "@/lib/auth";
import { ROLES, ROLE_GROUPS } from "@/lib/roles";
import { hasManagerAccessToTeams } from "@/services/teamService";
import { populateTeamsForEvents } from "@/lib/populateEventTeams";

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

        // Fetch event details with creator info
        const rawEvent = await Event.findById(id).populate('createdBy', 'firstName lastName email').lean() as any;
        if (!rawEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }
        const event = await populateTeamsForEvents(rawEvent);

        // Check creator ID (handling both populated object or ObjectId)
        const creatorId = event.createdBy?._id?.toString() || event.createdBy?.toString();

        // Restrict organizers and team managers to their own/managed events
        if (user.role === ROLES.ORGANIZER && creatorId !== user.id) {
            return NextResponse.json({ error: "Forbidden: You can only view events you created" }, { status: 403 });
        }

        if (user.role === ROLES.TEAM_MANAGER) {
            const isCreator = creatorId === user.id;
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
        const totalGeneratedTickets = tickets.length;

        // ── Calculate accurate successful sales count and revenue from TicketOrders ──
        const successfulOrders = await TicketOrder.find({ event: id, paymentStatus: 'success' }).lean() as any[];
        let successfulSoldCount = 0;
        let successfulRevenue = 0;

        successfulOrders.forEach((order: any) => {
            const ticketsData = order.tickets;
            if (!ticketsData) return;
            if (Array.isArray(ticketsData)) {
                ticketsData.forEach((item: any) => {
                    const qty = Number(item.quantity) || 0;
                    const price = Number(item.price) || 0;
                    successfulSoldCount += qty;
                    successfulRevenue += qty * price;
                });
            } else {
                Object.entries(ticketsData).forEach(([key, val]: [string, any]) => {
                    if (typeof val === 'number') {
                        successfulSoldCount += val;
                    } else {
                        const qty = Number(val?.quantity || val?.qty || 1);
                        const price = Number(val?.price || 0);
                        successfulSoldCount += qty;
                        successfulRevenue += qty * price;
                    }
                });
            }
        });

        // If there are no TicketOrders yet, check if there are direct tickets with successful payment
        if (successfulSoldCount === 0) {
            const paidTickets = tickets.filter(t => t.payment?.status === 'success' || t.generatedBy === 'online-sale');
            if (paidTickets.length > 0) {
                successfulSoldCount = paidTickets.length;
                successfulRevenue = paidTickets.reduce((sum, t) => sum + (t.price || 0), 0);
            }
        }

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
            totalTickets: successfulSoldCount,
            totalGeneratedTickets,
            successfulSoldCount,
            totalRevenue: successfulRevenue,
            checkedInCount,
            checkInRate: successfulSoldCount > 0
                ? Math.min(100, (checkedInCount / successfulSoldCount) * 100)
                : (totalGeneratedTickets > 0 ? Math.min(100, (checkedInCount / totalGeneratedTickets) * 100) : 0),
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

