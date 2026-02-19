import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import { getUserFromCookie } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const admin = await getUserFromCookie();
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Fetch logs with populated admin names
        const logs = await AuditLog.find({})
            .populate('adminId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(100);

        return NextResponse.json({ success: true, logs });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
