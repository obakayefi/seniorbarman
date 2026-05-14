import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromCookie } from "@/lib/auth";
import { HunchoRoleChecker } from "@/lib/helpers";
import { recordAuditLog } from "@/lib/audit";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { role: newRole } = await req.json();

        if (!newRole) {
            return NextResponse.json({ error: "Role is required" }, { status: 400 });
        }

        const user = await getUserFromCookie();
        if (!HunchoRoleChecker(user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const targetUser = await User.findById(id);
        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const oldRole = targetUser.role;
        targetUser.role = newRole;
        await targetUser.save();

        // Record Audit Log
        await recordAuditLog({
            adminId: user!.id,
            action: "UPDATE_USER_ROLE",
            targetType: "USER",
            targetId: id,
            details: {
                oldRole,
                newRole,
                userEmail: targetUser.email
            }
        });

        return NextResponse.json({ success: true, message: "Role updated successfully" });
    } catch (error: any) {
        console.error("Update user role error:", error);
        return NextResponse.json(
            { error: "Failed to update role: " + error.message },
            { status: 500 }
        );
    }
}
