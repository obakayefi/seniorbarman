import {NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Event from "@/models/Event"
import {TicketPayload} from "@/types/data";
import {cookies} from "next/headers";
import jwt, {JwtPayload} from "jsonwebtoken";
import User from "@/models/User";

type Params = {
    params: Promise<{ hashToken: string }>;
};

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
        //console.log({ticket})
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
        console.log({gateAction, logs: ticket.checkInLogs})
        ticket.isInside = true;

        if (ticket.checkInLogs?.length < 1) {
            console.log('Log below 1')
            event = await Event.findByIdAndUpdate(ticket.event._id, {
                $inc: {
                    peopleInside: 1,
                    totalPeople: 1,
                }
            })
        } else {
            console.log('Log above 1')
            event = await Event.findByIdAndUpdate(ticket.event._id, {
                $inc: {
                    peopleInside: 1,
                    // peopleOutside: -1
                }
            })
        }
        
        ticket.checkInLogs.push(gateAction)
        await ticket.save()
        let updatedTicket = await Ticket.findOne({checkInToken: hashToken}).populate("event").populate("createdBy");
        console.log({ticketOnIn: updatedTicket, modifiedEvent: event})
        return NextResponse.json({
            message: "Ticket successfully checked in",
            result: {ticket: updatedTicket, user},
        });
    } catch (error) {
        console.error("Error checking in ticket:", error);
        return NextResponse.json(
            {error: "Internal server error"},
            {status: 500}
        );
    }
}
