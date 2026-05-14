import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import EventApplication from "@/models/EventApplication";
import User from "@/models/User";
import { getUserFromCookie } from "@/lib/auth";
import { redis } from "@/lib/redis";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        User.init();
        
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const { eventId } = body;

        const application = await EventApplication.findById(id).populate("event user");

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        if (application.status !== "approved") {
            return NextResponse.json(
                { error: "Application is not approved" },
                { status: 400 }
            );
        }

        if (eventId && application.event?._id?.toString() !== eventId) {
            return NextResponse.json(
                { error: "Event Mismatch", details: { message: "This application is for a different event.", ticket: application } },
                { status: 400 }
            );
        }

        if (application.isInside) {
            return NextResponse.json(
                { error: "Already checked in", details: { canCheckOut: true, ticket: application } },
                { status: 400 }
            );
        }

        const user = await getUserFromCookie();

        const gateAction = {
            time: new Date(),
            action: "entry",
            method: "QR Code",
            performedBy: user?.id
        };

        application.isInside = true;
        application.checkInLogs.push(gateAction);
        await application.save();

        const payload = {
            type: "new_scan",
            eventId: application.event._id.toString(),
            scan: {
                time: new Date().toLocaleTimeString(),
                userName: application.user?.firstName || "Unknown",
                stand: "Audition",
                status: "IN",
                success: true
            }
        };

        try {
            await redis.publish(`event_update:${application.event._id.toString()}`, JSON.stringify(payload));
        } catch (err) {
            console.error("Redis broadcast failed", err);
        }

        return NextResponse.json(
            { message: "Successfully checked in", result: { ticket: application } },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
