import {NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import {cookies} from "next/headers";
import Event from "@/models/Event";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import jwt, {JwtPayload} from "jsonwebtoken";


type Params = {
    params: Promise<{ hashToken: string }>;
};

export async function GET(req: Request, {params}: Params) {
    try {
        await connectDB();
        const token = (await cookies()).get("token")?.value;

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
        if (typeof decoded === "string") {
            throw Error("Invalid token format");
        }

        const userId = (decoded as JwtPayload).id;

        if (!token) {
            return NextResponse.json(
                {error: "Unauthorized: No token provided"},
                {status: 401}
            );
        }

        // ✅ Await v directly — not props.context.v
        const {hashToken: eventId} = await params;

        const event = await Event.findById(eventId)
        const tickets = await Ticket.find({ createdBy: userId }).populate("event");
        // const tickets = await Ticket.find({createdBy: userId});
        const ticketList = new Map<string, { event: any, tickets: any[] }>()
        const ticketCount: Record<string, Record<string, number>> = {};

        for (const ticket of tickets) {
            const eventId = ticket.event._id.toString();
            const stand = ticket.stand || "Regular";

            if (!ticketCount[eventId]) {
                ticketCount[eventId] = {};
            }

            ticketCount[eventId][stand] = (ticketCount[eventId][stand] || 0) + 1;
        }

        const arraySummary = Object.entries(ticketCount).map(([eventId, stands]) => ({
            eventId,
            stands
        }));
        
        const specificSummary = arraySummary.filter(summary => summary.eventId === eventId)[0].stands;
        const transformedSummary = Object.entries(specificSummary).map(([name, value]) => ({
            name,
            value
        }));

        for (const ticket of tickets) {
            const _eventId = ticket.event._id.toString();

            if (_eventId !== eventId) {
                continue;
            }
            
            if (!ticketList.has(_eventId)) {
                ticketList.set(_eventId, {
                    event: ticket.event,
                    tickets: []
                })
            }
            ticketList.get(_eventId)!.tickets.push(ticket)
        }
        
        if (!tickets) {
            return NextResponse.json(
                {error: "Could not find event for this ticket"},
                {status: 404}
            );
        }
        
        const matchedTicket = ticketList.get(eventId);
        console.log({ticketList, matchedTicket});
        const response = {
            event,
            tickets: matchedTicket,
            summary: transformedSummary
        }
        
        return NextResponse.json(
            {message: "Ticket found", response},
            {status: 200}
        );
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            {error: "Internal Server Error"},
            {status: 500}
        );
    }
}
