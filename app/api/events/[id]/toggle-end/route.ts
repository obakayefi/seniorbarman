import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromCookie } from "@/lib/auth";
import Event from "@/models/Event";
import { redis } from "@/lib/redis";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();

        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Permission check: admin, dev, or owner
        const isOwner = event.createdBy?.toString() === user.id;
        const isAdmin = user.role === "admin" || user.role === "dev";

        if (!isOwner && !isAdmin) {
            return NextResponse.json(
                { error: "Forbidden: You do not have permission to manage this event" },
                { status: 403 }
            );
        }

        // Check if event has already started
        const eventDate = new Date(event.date);
        const now = new Date();

        if (now < eventDate) {
            return NextResponse.json(
                { error: "Event has not started yet. You can only end an event after its start time." },
                { status: 400 }
            );
        }

        const body = await req.json().catch(() => ({}));
        const newIsEnded = typeof body.isEnded === "boolean" ? body.isEnded : !event.isEnded;

        event.isEnded = newIsEnded;
        await event.save();

        // Invalidate Redis caches if any
        try {
            await redis.del(`event:${id}`);
        } catch (e) {
            // Ignore redis errors
        }

        return NextResponse.json(
            {
                success: true,
                message: newIsEnded
                    ? "Event has been ended and ticket sales suspended."
                    : "Event has been re-activated for sales.",
                isEnded: event.isEnded,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Toggle end event error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
