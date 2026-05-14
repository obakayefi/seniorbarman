import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { cookies } from "next/headers";
import Event from "@/models/Event";
import Ticket from "@/models/Ticket";
import TicketOrder from "@/models/TicketOrder";
import User from "@/models/User";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "@/lib/redis";


type Params = {
    params: Promise<{ hashToken: string }>;
};

export async function GET(req: Request, { params }: Params) {
    try {
        await connectDB();
        const token = (await cookies()).get("token")?.value;
        console.log("Hash token request started...")

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
        if (typeof decoded === "string") {
            throw Error("Invalid token format");
        }

        const userId = (decoded as JwtPayload).id;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized: No token provided" },
                { status: 401 }
            );
        }

        // ✅ Await v directly — not props.context.v
        const { hashToken: eventId } = await params;

        // Retrieve from Upstash
        const cacheKey = `user_event_tickets:${userId}:${eventId}`
        const cachedData = await redis.get(cacheKey)
        console.log({ cachedData, cacheKey });

        if (cachedData) {
            return NextResponse.json(
                { message: "Ticket found(cached)", response: cachedData },
                { status: 200 }
            )
        }

        //Cache Miss - Retrieve from database
        const event = await Event.findById(eventId);
        const tickets = await Ticket.find({ createdBy: userId }).populate("event");
        const pendingOrders = await TicketOrder.find({ event: eventId, user: userId, isGenerated: false }).lean();

        const ticketCount: Record<string, Record<string, number>> = {};

        for (const ticket of tickets) {
            const ticketEventId = ticket.event?._id?.toString() || ticket.event?.toString();
            if (!ticketEventId) continue;

            const stand = ticket.stand || "Regular";

            if (!ticketCount[ticketEventId]) {
                ticketCount[ticketEventId] = {};
            }

            ticketCount[ticketEventId][stand] = (ticketCount[ticketEventId][stand] || 0) + 1;
        }

        const specificSummary = ticketCount[eventId] || {};
        const transformedSummary = Object.entries(specificSummary).map(([name, value]) => ({
            name,
            value
        }));

        const matchedTickets = tickets.filter(ticket => {
            const ticketEventId = ticket.event?._id?.toString() || ticket.event?.toString();
            return ticketEventId === eventId;
        });

        if (matchedTickets.length === 0 && pendingOrders.length === 0 && !event) {
            return NextResponse.json(
                { error: "Could not find event or tickets for this ID" },
                { status: 404 }
            );
        }

        const response = {
            event: event || { _id: eventId, title: "Deleted Event", isOrphaned: true, type: 'event' },
            tickets: {
                event: event || { _id: eventId },
                tickets: matchedTickets
            },
            summary: transformedSummary,
            pendingOrders
        }

        const updateCache = await redis.set(cacheKey, response, { ex: 1800 })

        return NextResponse.json(
            { message: "Ticket found", response },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
