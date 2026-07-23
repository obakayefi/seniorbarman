import AuditLog from "@/models/AuditLog";
import { connectDB } from "./mongodb";

export interface RecordAuditLogParams {
    actorId?: string;
    adminId?: string; // Legacy parameter support
    actorRole?: string;
    action: string;
    targetType: string;
    targetId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    req?: Request;
}

export async function recordAuditLog({
    actorId,
    adminId,
    actorRole,
    action,
    targetType,
    targetId,
    details,
    ipAddress,
    userAgent,
    req
}: RecordAuditLogParams) {
    try {
        await connectDB();
        
        const finalActorId = actorId || adminId;
        if (!finalActorId) {
            console.error("Failed to record audit log: actorId or adminId is required");
            return;
        }

        let finalIp = ipAddress;
        let finalUserAgent = userAgent;

        if (req) {
            finalIp = finalIp || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined;
            finalUserAgent = finalUserAgent || req.headers.get("user-agent") || undefined;
        }

        await AuditLog.create({
            actorId: finalActorId,
            adminId: finalActorId,
            actorRole,
            action,
            targetType,
            targetId,
            details,
            ipAddress: finalIp,
            userAgent: finalUserAgent,
        });
    } catch (error) {
        console.error("Failed to record audit log:", error);
    }
}

