import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import { requireRole } from "@/lib/requireRole";

export const dynamic = 'force-dynamic';

/**
 * GET /api/teams/mine
 * Returns the team(s) managed by the currently authenticated user.
 * Only accessible by team_manager, admin, or dev roles.
 */
export async function GET() {
    const authResult = await requireRole(["team_manager", "admin", "dev"]);
    if (authResult instanceof NextResponse) return authResult;

    try {
        await connectDB();

        const teams = await Team.find({ managers: authResult.id })
            .select("_id name logo stadium")
            .lean();

        return NextResponse.json({ success: true, teams });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch managed teams", details: error.message },
            { status: 500 }
        );
    }
}
