import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { requireRole } from "@/lib/requireRole";
import { ROLES } from "@/lib/roles";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        
        const authResult = await requireRole([ROLES.ORGANIZER, ROLES.TEAM_MANAGER]);
        if (authResult instanceof NextResponse) return authResult;

        // Fetch events created by this organizer
        const events = await Event.find({ createdBy: authResult.id })
            .populate('homeTeam', 'name')
            .populate('awayTeam', 'name')
            .sort({ date: -1 })
            .lean();

        return NextResponse.json({ success: true, events }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch organizer events: " + error.message },
            { status: 500 }
        );
    }
}
