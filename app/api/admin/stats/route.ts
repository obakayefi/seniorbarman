import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Event from "@/models/Event";
import { requireRole } from "@/lib/requireRole";
import { ROLE_GROUPS } from "@/lib/roles";

export const dynamic = 'force-dynamic';

export async function GET() {
    const authResult = await requireRole(ROLE_GROUPS.ELEVATED);
    if (authResult instanceof NextResponse) return authResult;

    try {
        await connectDB();

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const [
            totalUsers,
            totalEvents,
            upcomingEvents,
            totalAuditions,
        ] = await Promise.all([
            User.countDocuments(),
            Event.countDocuments(),
            Event.countDocuments({ date: { $gte: now } }),
            Event.countDocuments({ isAudition: true }),
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers,
                totalEvents,
                upcomingEvents,
                totalAuditions,
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch admin stats", details: error.message },
            { status: 500 }
        );
    }
}
