import {NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Event from "@/models/Event"
import {TicketPayload} from "@/types/data";
import {cookies} from "next/headers";
import jwt, {JwtPayload} from "jsonwebtoken";
import User from "@/models/User";
import {PrepareEventStats} from "@/lib/utils";

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
    
    if (gateAction.action === 'entry') {
        totalInsideStadium += 1
    } else if (gateAction.action === 'exit') {
        totalOutsideStadium += 1
    }
    
    
    for (let ticket of _ticketsCheckedIn) {
        const lastLog = ticket.checkInLogs[ticket.checkInLogs.length - 1];
        const beforeLast = ticket.checkInLogs[ticket.checkInLogs.length - 2];
                
        if (lastLog.action === "entry") {
            console.log({entry: lastLog.action})
            totalInsideStadium += 1
            if (beforeLast && beforeLast.action === "exit") {
                totalOutsideStadium -= 1
            }
        }
        
        if (lastLog.action === "exit") {
            if (beforeLast && beforeLast.action === "entry") {
                totalInsideStadium -= 1;
            }
            totalOutsideStadium += 1
        }
        
    }

    console.log({ totalInsideStadium, totalOutsideStadium, allTickets: tickets.length });
    
    const eventTicketStats = PrepareEventStats(tickets);
   
    return {
        allPurchasedTickets: tickets.length,
        eventTicketStats,
        totalOutsideStadium,
        totalInsideStadium,
        totalCheckedIn,
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
        let user = await User.findById(ticket.createdBy)
        let event;
        
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
        // console.log({gateAction, logs: ticket.checkInLogs})
        ticket.isInside = true;

        if (ticket.checkInLogs?.length < 1) {
            console.log('Log below 1')
            // event = await Event.findByIdAndUpdate(ticket.event._id, {
            //     $inc: {
            //         peopleInside: 1,
            //         totalPeople: 1,
            //     }
            // })
        } else { 
            console.log('Log above 1')
            // event = await Event.findByIdAndUpdate(ticket.event._id, {
            //     $inc: {
            //         peopleInside: 1,
            //         // peopleOutside: -1
            //     }
            // })
        }
        
        ticket.checkInLogs.push(gateAction)
        await ticket.save()
        let updatedTicket = await Ticket.findOne({checkInToken: hashToken}).populate("event").populate("createdBy");
        const ticketsForEvent = await Ticket.find({event: ticket.event})
        const eventTicketStats = PrepareEventStats(ticketsForEvent);
        console.log({eventTicketStats})
        return NextResponse.json({
            message: "Ticket successfully checked in",
            result: {ticket: updatedTicket, user, eventTicketStats},
        });
    } catch (error) {
        console.error("Error checking in ticket:", error);
        return NextResponse.json(
            {error: "Internal server error"},
            {status: 500}
        );
    }
}
