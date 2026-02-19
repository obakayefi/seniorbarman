import AuditLog from "@/models/AuditLog";
import { connectDB } from "./mongodb";

export async function recordAuditLog({
    adminId,
    action,
    targetType,
    targetId,
    details
}: {
    adminId: string;
    action: string;
    targetType: string;
    targetId?: string;
    details?: any;
}) {
    try {
        await connectDB();
        await AuditLog.create({
            adminId,
            action,
            targetType,
            targetId,
            details
        });
    } catch (error) {
        console.error("Failed to record audit log:", error);
    }
}
