import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { requireRole } from "@/lib/requireRole";

export const dynamic = 'force-dynamic';

export async function GET() {
    const authResult = await requireRole(["organizer", "admin", "dev"]);
    if (authResult instanceof NextResponse) return authResult;

    try {
        await connectDB();

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // Total regular events (all time)
        const totalEvents = await Event.countDocuments({ type: "event" });

        // Upcoming regular events
        const upcomingEvents = await Event.countDocuments({
            type: "event",
            date: { $gte: now }
        });

        // Past regular events
        const pastEvents = await Event.countDocuments({
            type: "event",
            date: { $lt: now }
        });

        // Recent events (last 5 regular events, newest first)
        const recentEvents = await Event.find({ type: "event" })
            .sort({ date: -1 })
            .limit(5)
            .lean();

        // Events this month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const eventsThisMonth = await Event.countDocuments({
            type: "event",
            date: { $gte: startOfMonth, $lte: endOfMonth }
        });

        return NextResponse.json({
            success: true,
            stats: {
                totalEvents,
                upcomingEvents,
                pastEvents,
                eventsThisMonth,
                recentEvents: recentEvents.map((e: any) => ({
                    _id: e._id,
                    title: e.title || "Untitled Event",
                    date: e.date,
                    venue: e.venue,
                    ticketTypes: e.ticketTypes || [],
                }))
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch organizer stats", details: error.message },
            { status: 500 }
        );
    }
}
