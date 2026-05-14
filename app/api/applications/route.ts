import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromCookie } from "@/lib/auth";
import EventApplication from "@/models/EventApplication";
import Event from "@/models/Event";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        await connectDB();
        const user = await getUserFromCookie();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch applications for the logged-in user, populating the event details
        const applications = await EventApplication.find({ user: user.id })
            .populate({
                path: "event",
                model: Event,
                select: "title homeTeam awayTeam type date venue image applicationFee"
            })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ applications }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching applications:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
