import {NextResponse} from "next/server"
import Event from "@/models/Event"
import Ticket from "@/models/Ticket";
import {getUserFromCookie} from "@/lib/auth";
import {PrepareEventStats} from "@/lib/utils";

export async function GET(req: Request, context: { params: { id: string } }) {
    try {
        const {id} = await context.params
        const ticketsForEvent = await Ticket.find({event: id})
        const eventTicketStats = PrepareEventStats(ticketsForEvent)
        
        return NextResponse.json(
            {message: "Gotten all tickets", ticketsForEvent, eventTicketStats},
            {status: 200}
        )
    } catch (e: any) {
        return NextResponse.json(
            {error: "Error while fetching event stats", message: e.message},
            {status: 401}
        )
    }
}