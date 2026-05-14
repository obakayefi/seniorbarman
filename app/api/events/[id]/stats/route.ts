import { NextResponse } from "next/server"
import Event from "@/models/Event"
import Ticket from "@/models/Ticket";
import { getUserFromCookie } from "@/lib/auth";
import { PrepareEventStats } from "@/lib/utils";
import { connectDB } from "@/lib/mongodb";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDB()
        const { id } = await context.params
        const event = await Event.findById(id);
        
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        let itemsForStats = [];
        if (event.isAudition || event.requiresApplication) {
            const EventApplicationModel = (await import("@/models/EventApplication")).default;
            const applications = await EventApplicationModel.find({ event: id, status: "approved" }).populate("user").lean();
            itemsForStats = applications.map((app: any) => ({
                ...app,
                stand: "Audition" // Label applications for the breakdown UI
            }));
        } else {
            itemsForStats = await Ticket.find({ event: id }).populate("createdBy").lean();
        }

        const eventTicketStats = PrepareEventStats(itemsForStats);

        return NextResponse.json(
            { message: "Gotten event statistics", itemsForStats, eventTicketStats },
            { status: 200 }
        );
    } catch (e: any) {
        return NextResponse.json(
            { error: "Error while fetching event stats", message: e.message },
            { status: 401 }
        )
    }
}