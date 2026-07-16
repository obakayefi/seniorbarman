import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import User from "@/models/User";
import { requireRole } from "@/lib/requireRole";
import { ROLES } from "@/lib/roles";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        
        const authResult = await requireRole([ROLES.TEAM_MANAGER]);
        if (authResult instanceof NextResponse) return authResult;

        // Fetch all users with role 'team_manager'
        const teamManagers = await User.find({ role: ROLES.TEAM_MANAGER }).select("_id").lean();
        const managerIds = teamManagers.map(tm => tm._id);

        // Fetch audit logs performed by team managers
        const logs = await AuditLog.find({ adminId: { $in: managerIds } })
            .populate("adminId", "firstName lastName email role")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, logs }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch team manager logs: " + error.message },
            { status: 500 }
        );
    }
}
