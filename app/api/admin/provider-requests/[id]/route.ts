import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ProviderAccountRequest from "@/models/ProviderAccountRequest";
import BlacklistedUser from "@/models/BlacklistedUser";
import User from "@/models/User";
import Team from "@/models/Team";
import { requireRole } from "@/lib/requireRole";
import { recordAuditLog } from "@/lib/audit";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireRole(["admin", "dev"]);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { id } = await params;
        const { status, reviewNote } = await req.json();

        if (!["approved", "rejected"].includes(status)) {
            return NextResponse.json({ error: "Status must be 'approved' or 'rejected'" }, { status: 400 });
        }

        await connectDB();

        const request = await ProviderAccountRequest.findById(id).populate("userId");
        if (!request) {
            return NextResponse.json({ error: "Provider request not found" }, { status: 404 });
        }
        if (request.status !== "pending") {
            return NextResponse.json({ error: "Request has already been reviewed" }, { status: 409 });
        }

        // Update the request
        request.status = status;
        request.reviewedBy = authResult.id;
        request.reviewNote = reviewNote || "";
        await request.save();

        if (status === "approved") {
            // Elevate the user's role
            await User.findByIdAndUpdate(request.userId, { role: request.role });

            // If team_manager, add them to the team's managers array
            if (request.role === "team_manager" && request.teamId) {
                await Team.findByIdAndUpdate(request.teamId, {
                    $addToSet: { managers: request.userId }
                });
            }

            await recordAuditLog({
                actorId: authResult.id,
                actorRole: authResult.role,
                action: "APPROVE_PROVIDER_REQUEST",
                targetType: "USER",
                targetId: String(request.userId._id || request.userId),
                details: {
                    email: request.email,
                    role: request.role,
                    teamId: request.teamId,
                },
                req,
            });

            return NextResponse.json({ success: true, message: `Account approved as ${request.role}` });
        }

        if (status === "rejected") {
            // Blacklist the email
            await BlacklistedUser.findOneAndUpdate(
                { email: request.email.toLowerCase() },
                {
                    email: request.email.toLowerCase(),
                    reason: reviewNote || "Provider account request rejected by admin",
                    blacklistedBy: authResult.id,
                },
                { upsert: true, new: true }
            );

            // Also delete the user account itself to clean up
            await User.findByIdAndDelete(request.userId);

            await recordAuditLog({
                actorId: authResult.id,
                actorRole: authResult.role,
                action: "REJECT_PROVIDER_REQUEST",
                targetType: "USER",
                targetId: String(request.userId._id || request.userId),
                details: {
                    email: request.email,
                    role: request.role,
                    reason: reviewNote,
                },
                req,
            });

            return NextResponse.json({ success: true, message: "Account rejected and email blacklisted" });
        }

    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to process request", details: error.message },
            { status: 500 }
        );
    }
}
