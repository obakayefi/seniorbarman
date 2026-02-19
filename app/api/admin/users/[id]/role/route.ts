import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromCookie } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const admin = await getUserFromCookie();
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { role } = await req.json();
        const validRoles = ["user", "organizer", "bouncer", "admin"];

        if (!validRoles.includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        await connectDB();
        const { id } = await params;
        const targetUser = await User.findById(id);

        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const oldRole = targetUser.role;
        targetUser.role = role;
        await targetUser.save();

        // Record Audit Log
        await recordAuditLog({
            adminId: admin.id,
            action: "CHANGE_ROLE",
            targetType: "USER",
            targetId: id,
            details: {
                userEmail: targetUser.email,
                oldRole,
                newRole: role
            }
        });

        return NextResponse.json({ success: true, user: targetUser });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
