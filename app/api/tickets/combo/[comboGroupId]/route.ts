import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getUserFromCookie } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ comboGroupId: string }> }
) {
    try {
        await connectDB();
        const user = await getUserFromCookie();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { comboGroupId } = await params;

        if (!comboGroupId) {
            return NextResponse.json({ error: "Missing comboGroupId" }, { status: 400 });
        }

        // Find all tickets belonging to this combo group
        const tickets = await Ticket.find({ comboGroupId })
            .populate("event")
            .sort({ createdAt: 1 });

        if (!tickets || tickets.length === 0) {
            return NextResponse.json({ error: "Combo pack not found" }, { status: 404 });
        }

        // Auth guard: User must own the tickets, or have elevated permissions (admin/dev)
        const isOwner = tickets[0].createdBy?.toString() === user.id;
        const isElevated = user.role === "admin" || user.role === "dev";

        if (!isOwner && !isElevated) {
            return NextResponse.json({ error: "Forbidden: You do not own this combo pack" }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            comboGroupId,
            event: tickets[0].event,
            totalTickets: tickets.length,
            tickets
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error fetching combo pack tickets:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
