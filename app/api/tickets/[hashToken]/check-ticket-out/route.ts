import {NextResponse} from 'next/server'
import {connectDB} from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import Event from "@/models/Event";
import {PrepareEventStats} from "@/lib/utils";

type Params = {
    params: Promise<{ hashToken: string }>
}

export async function POST(req: Request, {params}: Params) {
    try {
        await connectDB()
        const {hashToken} = await params

        const gateAction = {
            action: "exit",
            method: "QR Code",
            time: new Date(),
            location: "Gate 1"
        }

        console.log({hashToken, gateAction})

        if (!hashToken) {
            return NextResponse.json(
                {error: "Invalid hash token"},
                {status: 400}
            )
        }

        let ticket = await Ticket.findOne({checkInToken: hashToken}).populate("event")
        let user = await User.findById(ticket.createdBy)
        let event;

        if (!ticket) {
            return NextResponse.json(
                {error: "Ticket not found"},
                {status: 404}
            );
        }

        ticket.isInside = false;

        event = await Event.findByIdAndUpdate(ticket.event._id, {
            $inc: {
                // peopleInside: -1,
                peopleOutside: 1
            }
        })

        ticket.checkInLogs.push(gateAction)
        await ticket.save()
        //console.log({ticketOnOut: ticket, modifiedEvent: event})
        const updatedTicket = await Ticket.findOne({checkInToken: hashToken}).populate("event");
        const ticketsForEvent = await Ticket.find({event: ticket.event})
        const eventTicketStats = PrepareEventStats(ticketsForEvent);
        console.log({eventTicketStats})
        return NextResponse.json(
            {
                message: "Checking User Out",
                result: {ticket: updatedTicket, user, eventTicketStats}
            },
            {status: 200}
        )
    } catch (e: any) {
        return NextResponse.json(
            {error: "Error checking user out"}
        )
    }
}