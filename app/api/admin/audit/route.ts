import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import { getUserFromCookie } from "@/lib/auth";
import { HunchoRoleChecker } from "@/lib/helpers";
import User from "@/models/User";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getUserFromCookie();
        const canAccessResource = HunchoRoleChecker(user?.role);

        if (!canAccessResource) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
        const skip = (page - 1) * limit;

        const actionFilter = searchParams.get("action");
        const actorRoleFilter = searchParams.get("actorRole");
        const targetTypeFilter = searchParams.get("targetType");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        let query: any = {};

        // If not a dev, filter out logs created by devs
        if (user?.role !== 'dev') {
            const devUsers = await User.find({ role: 'dev' }, '_id');
            const devIds = devUsers.map(u => u._id);
            query.$or = [
                { actorId: { $nin: devIds } },
                { adminId: { $nin: devIds } }
            ];
        }

        if (actionFilter) {
            query.action = actionFilter;
        }

        if (actorRoleFilter) {
            query.actorRole = actorRoleFilter;
        }

        if (targetTypeFilter) {
            query.targetType = targetTypeFilter;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .populate('actorId adminId', 'firstName lastName email role')
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
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
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

