import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Team from "@/models/Team";
import { requireRole } from "@/lib/requireRole";
import { ROLES } from "@/lib/roles";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        
        const authResult = await requireRole([ROLES.ORGANIZER, ROLES.TEAM_MANAGER]);
        if (authResult instanceof NextResponse) return authResult;

        let query: any = { createdBy: authResult.id };

        if (authResult.role === ROLES.TEAM_MANAGER) {
            const managedTeams = await Team.find({ managers: authResult.id }).select("_id");
            const managedTeamIds = managedTeams.map((t: any) => t._id);
            query = {
                $or: [
                    { createdBy: authResult.id },
                    { type: 'sports', homeTeam: { $in: managedTeamIds } },
                    { type: 'sports', awayTeam: { $in: managedTeamIds } }
                ]
            };
        }

        // Fetch events created by this organizer or managed by team manager
        const events = await Event.find(query)
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
