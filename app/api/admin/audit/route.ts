import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import { getUserFromCookie } from "@/lib/auth";
import { HunchoRoleChecker } from "@/lib/helpers";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        const user = await getUserFromCookie();
        const canAccessResource = HunchoRoleChecker(user?.role)

        if (!canAccessResource) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        let query = {};
        
        // If not a dev, filter out logs created by devs
        if (user?.role !== 'dev') {
            const devUsers = await User.find({ role: 'dev' }, '_id');
            const devIds = devUsers.map(u => u._id);
            query = { adminId: { $nin: devIds } };
        }

        // Fetch logs with populated admin names
        const logs = await AuditLog.find(query)
            .populate('adminId', 'firstName lastName email role')
            .sort({ createdAt: -1 })
            .limit(100);

        return NextResponse.json({ success: true, logs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
