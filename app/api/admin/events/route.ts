import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Team from "@/models/Team";
import { getUserFromCookie } from "@/lib/auth";
import { HunchoRoleChecker } from "@/lib/helpers";
import { populateTeamsForEvents } from "@/lib/populateEventTeams";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await connectDB();
        Team.init();
        const user = await getUserFromCookie();

        const canAccessResource = HunchoRoleChecker(user?.role)

        if (!canAccessResource) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const rawEvents = await Event.find({})
            .populate('createdBy', 'firstName lastName email')
            .sort({ date: -1 })
            .lean();

        const events = await populateTeamsForEvents(rawEvents);

        return NextResponse.json({ success: true, events }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch all events: " + error.message },
            { status: 500 }
        );
    }
}
