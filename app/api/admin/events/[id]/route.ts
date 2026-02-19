import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Ticket from "@/models/Ticket";
import { getUserFromCookie } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await getUserFromCookie();

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Fetch event details
        const event = await Event.findById(id).lean();
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Fetch all tickets for this event
        const tickets = await Ticket.find({ event: id })
            .populate('createdBy', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .lean();

        // Calculate statistics
        const totalTickets = tickets.length;
        const totalRevenue = tickets.reduce((sum, t) => sum + (t.price || 0), 0);

        // Count by stand/category
        const categoryBreakdown: Record<string, number> = {};
        let checkedInCount = 0;

        tickets.forEach(ticket => {
            const stand = ticket.stand || "Regular";
            categoryBreakdown[stand] = (categoryBreakdown[stand] || 0) + 1;

            // Check-in status (using the same logic as the virtual 'status' if possible, 
            // but here we check logs directly for accuracy in the report)
            if (ticket.checkInLogs && ticket.checkInLogs.length > 0) {
                const lastLog = ticket.checkInLogs[ticket.checkInLogs.length - 1];
                // Simple logic: if ever checked in, count it? 
                // Or better: use the 'isInside' flag or current status.
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

        return NextResponse.json({
            success: true,
            event,
            tickets,
            stats
        }, { status: 200 });

    } catch (error: any) {
        console.error("Event detail fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch event statistics: " + error.message },
            { status: 500 }
        );
    }
}
