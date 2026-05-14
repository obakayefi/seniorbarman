import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getUserFromCookie } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();

        // Auth Check
        const user = await getUserFromCookie();
        if (!user || !['admin', 'dev', 'organizer'].includes(user.role)) {
            return NextResponse.json(
                { error: "Unauthorized: Access required" },
                { status: 401 }
            );
        }

        const { id: batchId } = await params;

        const tickets = await Ticket.find({ batchId: batchId }).populate('event');

        // Verify event ownership for organizer
        if (user.role === 'organizer' && tickets.length > 0) {
            const event = tickets[0].event;
            if (event.createdBy?.toString() !== user.id) {
                return NextResponse.json({ error: "Forbidden: Not your event" }, { status: 403 });
            }
        }

        return NextResponse.json({
            success: true,
            tickets
        });

    } catch (error: any) {
        console.error("Batch ticket fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch tickets: " + error.message },
            { status: 500 }
        );
    }
}
