import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromCookie } from "@/lib/auth";
import EventApplication from "@/models/EventApplication";
import Event from "@/models/Event";

export const dynamic = "force-dynamic";

// GET /api/events/[id]/applicants — organizer/admin only
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

        const applicants = await EventApplication.find({ event: id })
            .populate("user", "firstName lastName email createdAt")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ applicants, total: applicants.length }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
