import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import User from "@/models/User";
import { requireRole } from "@/lib/requireRole";
import { ROLES } from "@/lib/roles";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await connectDB();
        
        const authResult = await requireRole([ROLES.TEAM_MANAGER, ROLES.ADMIN, ROLES.DEV]);
        if (authResult instanceof NextResponse) return authResult;

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
        const skip = (page - 1) * limit;

        const actionFilter = searchParams.get("action");
        const targetTypeFilter = searchParams.get("targetType");

        // Fetch all users with role 'team_manager'
        const teamManagers = await User.find({ role: ROLES.TEAM_MANAGER }).select("_id").lean();
        const managerIds = teamManagers.map(tm => tm._id);

        let query: any = {
            $or: [
                { actorId: { $in: managerIds } },
                { adminId: { $in: managerIds } },
                { actorRole: ROLES.TEAM_MANAGER }
            ]
        };

        if (actionFilter) {
            query.action = actionFilter;
        }

        if (targetTypeFilter) {
            query.targetType = targetTypeFilter;
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .populate("actorId adminId", "firstName lastName email role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AuditLog.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch team manager logs: " + error.message },
            { status: 500 }
        );
    }
}

// Reject mutation methods to enforce read-only audit logging
export async function POST() {
    return NextResponse.json({ error: "Method Not Allowed. Audit logs are read-only." }, { status: 405 });
}
export async function PUT() {
    return NextResponse.json({ error: "Method Not Allowed. Audit logs are read-only." }, { status: 405 });
}
export async function PATCH() {
    return NextResponse.json({ error: "Method Not Allowed. Audit logs are read-only." }, { status: 405 });
}
export async function DELETE() {
    return NextResponse.json({ error: "Method Not Allowed. Audit logs are read-only." }, { status: 405 });
}

