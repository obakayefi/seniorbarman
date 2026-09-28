import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EventApplication from "@/models/EventApplication";
import { getUserFromCookie } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import { ROLE_GROUPS } from "@/lib/roles";

export async function POST(req: Request) {
    try {
        await connectDB();

        const user = await getUserFromCookie();
        const canAccessResource = user && ROLE_GROUPS.CAN_CREATE_EVENT.includes(user.role as any);

        if (!canAccessResource) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId, eventId, amountPaid = 0, applicantPicture, formAnswers } = await req.json();

        if (!userId || !eventId) {
            return NextResponse.json(
                { error: "Missing required fields: userId, eventId" },
                { status: 400 }
            );
        }

        // Check for existing application
        const existingApp = await EventApplication.findOne({ event: eventId, user: userId });
        if (existingApp) {
            return NextResponse.json(
                { error: "Application already exists for this user and event" },
                { status: 400 }
            );
        }

        const newApplication = await EventApplication.create({
            event: eventId,
            user: userId,
            status: "approved",
            paymentStatus: Number(amountPaid) > 0 ? "paid" : "free",
            amountPaid: Number(amountPaid) || 0,
            paymentRef: `ADMIN-GRANT-${Date.now()}`,
            applicantPicture: applicantPicture || "",
            formAnswers: formAnswers || [],
            submittedAt: new Date()
        });

        const populatedApp = await EventApplication.findById(newApplication._id)
            .populate("event", "title date venue image type")
            .populate("user", "firstName lastName email");

        // Record Audit Log
        await recordAuditLog({
            adminId: user!.id,
            action: "GRANT_APPLICATION",
            targetType: "EVENT_APPLICATION",
            targetId: newApplication._id.toString(),
            details: {
                recipientUserId: userId,
                eventId,
                amountPaid
            }
        });

        return NextResponse.json({
            success: true,
            message: "Audition application granted & approved successfully",
            application: populatedApp,
        }, { status: 201 });

    } catch (error: any) {
        console.error("Admin application grant error:", error);
        return NextResponse.json(
            { error: "Failed to grant application: " + error.message },
            { status: 500 }
        );
    }
}
