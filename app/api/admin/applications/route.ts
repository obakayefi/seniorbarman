import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromCookie } from "@/lib/auth";
import EventApplication from "@/models/EventApplication";
import Event from "@/models/Event";
import User from "@/models/User";
import Team from "@/models/Team";
import { populateTeamsForApplications } from "@/lib/populateEventTeams";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        await connectDB();
        Team.init();
        const user = await getUserFromCookie();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const isAdminOrDev = user.role === "admin" || user.role === "dev";
        const isOrganizer = user.role === "organizer";

        if (!isAdminOrDev && !isOrganizer) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        let query = {};
        if (isOrganizer && !isAdminOrDev) {
            // Find events created by this organizer
            const events = await Event.find({ createdBy: user.id }).select("_id");
            const eventIds = events.map(e => e._id);
            query = { event: { $in: eventIds } };
        }

        const rawApplications = await EventApplication.find(query)
            .populate({
                path: "event",
                model: Event,
                select: "title homeTeam awayTeam type date venue image applicationFee createdBy"
            })
            .populate({
                path: "user",
                model: User,
                select: "firstName lastName email"
            })
            .sort({ createdAt: -1 })
            .lean();

        const applications = await populateTeamsForApplications(rawApplications);

        return NextResponse.json({ success: true, applications }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching all applications:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
