import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromCookie } from "@/lib/auth";
import EventApplication from "@/models/EventApplication";
import Event from "@/models/Event";
import { getBaseUrl } from "@/lib/utils";
import cloudinary from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const application = await EventApplication.findOne({ event: id, user: user.id }).lean();
        return NextResponse.json({ application }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const event = await Event.findById(id).lean() as any;
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        if (!event.requiresApplication) {
            return NextResponse.json(
                { error: "This event does not require an application" },
                { status: 400 }
            );
        }

        const existing = await EventApplication.findOne({ event: id, user: user.id });
        const applicationFee = event.applicationFee || 0;
        const isFree = applicationFee === 0;

        if (existing && existing.paymentStatus !== "unpaid") {
             return NextResponse.json({ application: existing, alreadyExists: true }, { status: 200 });
        }

        let initialStatus = isFree ? "pending_form" : "pending_payment";
        let paymentStatus = isFree ? "free" : "unpaid";
        let paymentUrl: string | undefined = undefined;
        let reference: string | undefined = undefined;

        if (!isFree) {
            const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: user.email,
                    amount: applicationFee * 100,
                    metadata: {
                        type: "event_application",
                        eventId: id,
                        userId: user.id,
                        eventTitle: event.title || `${event.homeTeam} vs ${event.awayTeam}`,
                    },
                    callback_url: `${getBaseUrl()}/verify`,
                }),
            });

            const paystackData = await paystackRes.json();
            if (!paystackData.status) {
                return NextResponse.json(
                    { error: "Failed to initialize payment", details: paystackData.message },
                    { status: 500 }
                );
            }

            paymentUrl = paystackData.data.authorization_url;
            reference = paystackData.data.reference;
        }

        let application;
        if (existing) {
            existing.paymentRef = reference;
            await existing.save();
            application = existing;
        } else {
            application = await EventApplication.create({
                event: id,
                user: user.id,
                status: initialStatus,
                paymentStatus,
                paymentRef: reference,
            });
        }

        return NextResponse.json(
            { application, paymentUrl },
            { status: existing ? 200 : 201 }
        );
    } catch (error: any) {
        if (error.code === 11000) {
            const existing = await EventApplication.findOne({
                event: (await params).id,
                user: (await getUserFromCookie())?.id,
            });
            return NextResponse.json({ application: existing, alreadyExists: true }, { status: 200 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contentType = req.headers.get("content-type") || "";
        let formAnswers = [];
        let applicantPictureUrl = "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const formAnswersStr = formData.get("formAnswers") as string;
            const imageFile = formData.get("applicantPicture") as File;

            try {
                if (formAnswersStr) formAnswers = JSON.parse(formAnswersStr);
            } catch (e) {}

            if (imageFile) {
                const arrayBuffer = await imageFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const uploadResult: any = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: "seniorbarman/applicants" },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    ).end(buffer);
                });
                applicantPictureUrl = uploadResult.secure_url;
            }
        } else {
            const body = await req.json();
            formAnswers = body.formAnswers;
        }

        const application = await EventApplication.findOne({ event: id, user: user.id });
        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        if (application.paymentStatus === "unpaid") {
            return NextResponse.json(
                { error: "Payment required before submitting the form" },
                { status: 403 }
            );
        }

        if (application.status === "completed") {
            return NextResponse.json(
                { error: "Application already submitted" },
                { status: 400 }
            );
        }

        const event = await Event.findById(id).lean() as any;
        
        // Validate required fields
        const requiredFields = (event?.formFields || []).filter((f: any) => f.required);
        for (const field of requiredFields) {
            const answer = formAnswers?.find((a: any) => a.fieldLabel === field.label);
            const isEmpty = !answer || answer.answer === undefined || answer.answer === "" || (Array.isArray(answer.answer) && answer.answer.length === 0);
            if (isEmpty) {
                return NextResponse.json({ error: `"${field.label}" is required` }, { status: 400 });
            }
        }

        // Validate picture if required
        if (event.requestPicture && !applicantPictureUrl && !application.applicantPicture) {
            return NextResponse.json({ error: "Applicant photo is required" }, { status: 400 });
        }

        application.formAnswers = formAnswers || [];
        if (applicantPictureUrl) {
            application.applicantPicture = applicantPictureUrl;
        }
        application.status = "completed";
        application.submittedAt = new Date();
        await application.save();

        return NextResponse.json({ success: true, application }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
