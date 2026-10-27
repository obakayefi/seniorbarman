import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromCookie } from "@/lib/auth";
import EventApplication from "@/models/EventApplication";
import Event from "@/models/Event";
import Team from "@/models/Team";

export const dynamic = "force-dynamic";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string, appId: string }> }
) {
    try {
        const { id, appId } = await params;
        await connectDB();

        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check ownership or admin
        const event = await Event.findById(id).lean() as any;
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const isAdminOrDev = user.role === "admin" || user.role === "dev";
        const isOwner = event.createdBy?.toString() === user.id;

        if (!isAdminOrDev && !isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { status, reason } = await req.json();

        if (!["approved", "rejected", "pending_form", "completed"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const existingApplication = await EventApplication.findById(appId).lean() as any;
        if (!existingApplication) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // Only allow approval if the form is completed
        if (status === "approved" && !["completed", "approved", "rejected"].includes(existingApplication.status)) {
            return NextResponse.json({ 
                error: "Incomplete Application", 
                message: "This application cannot be approved because the applicant has not completed their form yet." 
            }, { status: 400 });
        }

        if (status === "rejected" && !reason) {
            return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
        }

        const updateData: any = { status };
        if (status === "rejected") {
            updateData.rejectionReason = reason;
        } else if (status === "pending_form") {
            updateData.formAnswers = [];
            updateData.$unset = {
                applicantPicture: 1,
                submittedAt: 1,
                rejectionReason: 1
            };
        } else {
            updateData.$unset = {
                rejectionReason: 1
            };
        }

        Team.init();
        Event.init();
        const application = await EventApplication.findByIdAndUpdate(
            appId,
            updateData,
            { new: true }
        ).populate({
            path: 'event',
            populate: [
                { path: 'homeTeam', select: 'name logo' },
                { path: 'awayTeam', select: 'name logo' }
            ]
        }).populate('user');

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        // Trigger notification on approval
        if (status === "approved") {
            const event = application.event as any;
            const applicant = application.user as any;
            const { notifyApplicantOfApproval } = await import('@/lib/notifications');
            const { formattedDate, formatEventTime } = await import('@/lib/utils');

            const { getBaseUrl } = await import('@/lib/utils');
            const previewUrl = `${getBaseUrl()}/applications/p/${application._id.toString()}`;

            await notifyApplicantOfApproval({
                userEmail: applicant.email,
                userName: applicant.firstName || applicant.username,
                userId: applicant._id.toString(),
                eventTitle: event.title || `${event.homeTeam} vs ${event.awayTeam}`,
                venue: event.venue,
                date: `${formattedDate(event.date)} at ${formatEventTime(event.date)}`,
                qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${previewUrl}`
            });
        } else if (status === "rejected") {
            const event = application.event as any;
            const applicant = application.user as any;
            const { notifyApplicantOfRejection } = await import('@/lib/notifications');

            await notifyApplicantOfRejection({
                userEmail: applicant.email,
                userName: applicant.firstName || applicant.username,
                userId: applicant._id.toString(),
                eventTitle: event.title || `${event.homeTeam} vs ${event.awayTeam}`,
                reason: reason
            });
        } else if (status === "pending_form") {
            const event = application.event as any;
            const applicant = application.user as any;
            const { notifyApplicantOfReset } = await import('@/lib/notifications');

            await notifyApplicantOfReset({
                userEmail: applicant.email,
                userName: applicant.firstName || applicant.username,
                userId: applicant._id.toString(),
                eventTitle: event.title || `${event.homeTeam} vs ${event.awayTeam}`,
                reason: reason || "Form reset by the organizer. Please update your details."
            });
        }

        return NextResponse.json({ success: true, application }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
