import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Team from "@/models/Team";
import { requireRole } from "@/lib/requireRole";

export const dynamic = 'force-dynamic';

export async function GET() {
    const authResult = await requireRole(["team_manager", "admin", "dev"]);
    if (authResult instanceof NextResponse) return authResult;

    try {
        await connectDB();

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        let query: any = { type: "sports" };

        if (authResult.role === "team_manager") {
            const managedTeams = await Team.find({ managers: authResult.id }).select("_id");
            const teamIds = managedTeams.map((t) => t._id);

            query.$or = [
                { homeTeam: { $in: teamIds } },
                { awayTeam: { $in: teamIds } }
            ];
        }

        // Total sports events
        const totalEvents = await Event.countDocuments(query);

        // Upcoming sports events
        const upcomingEvents = await Event.countDocuments({
            ...query,
            date: { $gte: now }
        });

        // Past sports events
        const pastEvents = await Event.countDocuments({
            ...query,
            date: { $lt: now }
        });

        // Recent events
        const recentEvents = await Event.find(query)
            .sort({ date: -1 })
            .limit(5)
            .populate("homeTeam", "name")
            .populate("awayTeam", "name")
            .lean();

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const eventsThisMonth = await Event.countDocuments({
            ...query,
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
                    title: `${e.homeTeam?.name || 'TBD'} vs ${e.awayTeam?.name || 'TBD'}`,
                    date: e.date,
                    venue: e.venue,
                    ticketTypes: e.ticketTypes || [],
                }))
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch team manager stats", details: error.message },
            { status: 500 }
        );
    }
}
