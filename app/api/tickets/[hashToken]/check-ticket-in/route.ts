import {NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Event from "@/models/Event"
import {TicketPayload} from "@/types/data";
import {cookies} from "next/headers";
import jwt, {JwtPayload} from "jsonwebtoken";
import User from "@/models/User";
import {PrepareEventStats} from "@/lib/utils";
import {emitWebhook} from "@/services/webhookService";

type Params = {
    params: Promise<{ hashToken: string }>;
};

const ProcessLogsForGameStats = (tickets: { checkInLogs: [] }[], gateAction: any) => {
    //console.log({forLogs: events.splice(0, 5)});
    let totalOutsideStadium = 0;
    let totalInsideStadium = 0;
    let totalCheckedIn = 0;
    
    const _ticketsCheckedIn = tickets.filter(event => event.checkInLogs.length > 0);
    totalCheckedIn = _ticketsCheckedIn.length;
    
    /*
    * check all tickets with logs
    * 
    * pick the last log on each ticket and if the action is exit add count of those outsideStadium
    * else if the action is entry increase totalinside
    * */
   
    return {
        allPurchasedTickets: tickets.length,
    };
}


export async function POST(req: Request, {params}: Params) {
    try {
        await connectDB();
        const {hashToken} = await params;

        if (!hashToken) {
            return NextResponse.json(
                {error: "Invalid action"},
                {status: 400}
            );
        }
        let ticket = await Ticket.findOne({checkInToken: hashToken}).populate("event");
        
        if (!ticket) {
            return NextResponse.json(
                {error: "Ticket not found"},
                {status: 404}
            );
        }

        const gateAction = {
            time: new Date(),
            action: "entry",
            method: "QR Code",
            location: "Gate 1"
        }
        ticket.isInside = true;
        
        ticket.checkInLogs.push(gateAction)
        await ticket.save()
        
        emitWebhook("ticket.check_in", {
            ticketId: ticket._id,
            userId: ticket,
            eventId: ticket.event,
            stand: ticket.stand,
            location: gateAction.location,
            method: gateAction.method,
        })
        
        let updatedTicket = await Ticket.findOne({checkInToken: hashToken}).populate("event").populate("createdBy");
        
        return NextResponse.json({
            message: "Ticket successfully checked in",
            result: {ticket: updatedTicket},
        });
    } catch (error) {
        console.error("Error checking in ticket:", error);
        return NextResponse.json(
            {error: "Internal server error"},
            {status: 500}
        );
    }
}
