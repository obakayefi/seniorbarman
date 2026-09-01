import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Resend } from 'resend'
import QRCode from 'qrcode'
import axios from "axios";
import api from "@/lib/axios";
import crypto from 'crypto'
import Ticket from "@/models/Ticket";
import TicketOrder from "@/models/TicketOrder";
import mongoose from "mongoose";
import { getUserFromCookie, verifyAuth } from "@/lib/auth";
import { StandType } from "@/types/components";
import { getBaseUrl } from "@/lib/utils";
import { summary } from "framer-motion/m";
import { redis } from "@/lib/redis";
import { populateTeamsForEvents } from "@/lib/populateEventTeams";


const resend = new Resend(process.env.RESEND_API_KEY)

// export async function POST(req: Request) {
//     // try {

//     // } catch (error: any) {

//     // }
//     NextResponse.json({
//         message: "Hello There!"
//     })

// }


async function SortTicketsForView(events: any[], tickets: any[], pendingOrders: any[] = []) {
    const ticketCount: Record<string, Record<string, number>> = {};
    const orphanedEventIds = new Set<string>();
    const pendingEventIds = new Set<string>();

    for (const order of pendingOrders) {
        const eventId = order.event?._id?.toString() || order.event?.toString();
        if (eventId) {
            pendingEventIds.add(eventId);
            const eventExists = events.some(e => e._id.toString() === eventId);
            if (!eventExists) orphanedEventIds.add(eventId);
        }
    }

    for (const ticket of tickets) {
        // Use the raw ID if the event is null (orphaned)
        const eventId = ticket.event?._id?.toString() || ticket.event?.toString();

        if (!eventId) continue;

        const stand = ticket.stand || "Regular";

        if (!ticketCount[eventId]) {
            ticketCount[eventId] = {};
        }

        ticketCount[eventId][stand] = (ticketCount[eventId][stand] || 0) + 1;

        // Check if this event exists in our list
        const eventExists = events.some(e => e._id.toString() === eventId);
        if (!eventExists) {
            orphanedEventIds.add(eventId);
        }
    }

    // Process existing events
    const extendedEvents = events.map(event => {
        const eventIdStr = event._id.toString();
        const plain = event.toObject ? event.toObject() : event;
        const matchedStands = ticketCount[eventIdStr];
        const transformedSummary = matchedStands ? Object.entries(matchedStands).map(([name, value]) => ({
            name,
            value
        })) : [];

        return {
            ...plain,
            transformedSummary,
            hasPendingOrders: pendingEventIds.has(eventIdStr)
        };
    });

    // Add orphaned events placeholders
    const orphanedGroups = Array.from(orphanedEventIds).map(eventId => {
        const matchedStands = ticketCount[eventId];
        const transformedSummary = matchedStands ? Object.entries(matchedStands).map(([name, value]) => ({
            name,
            value
        })) : [];

        return {
            _id: eventId,
            title: "Deleted Event",
            isOrphaned: true,
            transformedSummary,
            type: 'event', // Default to event for display
            hasPendingOrders: pendingEventIds.has(eventId)
        };
    });

    return [...extendedEvents, ...orphanedGroups];
}

export async function GET(req: Request) {
    try {
        await connectDB();
        await verifyAuth()

        // Get token from cookies
        const token = (await cookies()).get("token")?.value;
        // const { searchParams } = new URL(req.url)
        // const eventNumber = searchParams.get("event-number")

        //console.log({eventNumber})

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized: No token provided" },
                { status: 401 }
            );
        }
        // Decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, userId: string };
        const userId = decoded.id;

        const cacheKey = `TICKETS_${userId}`
        // Delete cache to force fresh fetch with populated team names/logos
        await redis.del(cacheKey)
        const cachedResponse = await redis.get(cacheKey)

        // Fetch events created by this user
        const tickets = await Ticket
            .find({ createdBy: userId })
            .lean()

        // Fetch pending ticket orders by this user
        const pendingOrders = await TicketOrder.find({ user: userId, isGenerated: false }).lean()

        // Handle case where user has no events
        if (!tickets.length && !pendingOrders.length) {
            return NextResponse.json({
                message: "No tickets found for this user",
                tickets: [],
            });
        }

        const rawEvents = await Event.find({}).lean();
        const events = await populateTeamsForEvents(rawEvents);

        // Debugging logs
        console.log(`[API] Fetching tickets. User: ${userId}`);
        console.log(`[API] Total raw tickets found: ${tickets.length}`);
        console.log(`[API] Total events found: ${events.length}`);

        const eventsSortedWithTickets = await SortTicketsForView(events, tickets, pendingOrders)

        // Filter out empty summaries (no tickets for that event) OR if they don't have pending orders
        const validTickets = eventsSortedWithTickets.filter(group =>
            (group.transformedSummary && group.transformedSummary.length > 0) || group.hasPendingOrders
        );

        console.log(`[API] Valid ticket groups after filtering: ${validTickets.length}`);

        const updatedCache = await redis.set(cacheKey, validTickets)

        console.log(`[API] Updated cache: ${updatedCache}`)

        return NextResponse.json({
            message: "tickets fetched successfully",
            tickets: validTickets,
        });
    } catch (error) {
        //  console.error("Error fetching user events:", error);
        return NextResponse.json(
            { error: "Failed to fetch events" },
            { status: 500 }
        );
    }
}

export async function PrintTickets(data: any, eventId: string, isPaid: boolean) {
    const userId = (await getUserFromCookie())?.id
    const _createdTickets = []
    const tickets = data.filter((ticket: any) => ticket.quantity !== 0)
    // console.log({nowTickets: tickets})

    for (let i = 0; i < tickets.length; i++) {
        // console.log({ singleTicket: tickets[i] })
        for (let j = 0; j < tickets[i].quantity; j++) {
            const ticketNumber = `${eventId}-${crypto.randomBytes(24).toString('hex')}`
            const ticketId = new mongoose.Types.ObjectId()
            // console.log({newTicketNumber: ticketNumber})
            const checkInToken = crypto.randomBytes(16).toString('hex')
            if (!ticketId) {
                return NextResponse.json({ error: "A ticket ID is required" },
                    { status: 500 })
            }
            const previewUrl = `${getBaseUrl()}/tickets/p/${checkInToken}`
            const qrCode = await QRCode.toDataURL(previewUrl)

            //console.log({ printNow: tickets[i], j, i })

            _createdTickets.push({
                _id: ticketId,
                checkInToken,
                payment: { status: isPaid ? 'success' : 'pending' },
                event: eventId,
                createdBy: userId,
                stand: tickets[i].name,
                price: tickets[i].price,
                ticketNumber: `${eventId}-${Date.now()}-${j}XSX`,
            })
        }

    }
    return _createdTickets
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json()

        const token = (await cookies()).get('token')?.value ?? ""
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
        if (typeof decoded === "string") {
            throw new Error("Invalid token format");
        }
        const userId = (decoded as JwtPayload).id;
        // const event = await Event.findById(data.eventId)
        let _createdTickets = []
        let totalTickets = 0

        data.ticketsToPurchase.forEach((ticket: any) => {
            totalTickets += ticket.quantity
        })

        if (totalTickets > 400) {
            // console.log('Bulk tickets are being generated...')
            return NextResponse.json({
                message: "Bulk Tickets Order, yet to structure"
            })
        } else {
            // console.log('Few tickets! Wait for your tickets', decoded)

            // prepare the ticket
            const tickets = data.ticketsToPurchase.filter((ticket: any) => ticket.quantity !== 0)

            for (let i = 0; i < tickets.length; i++) {
                for (let j = 0; j < tickets[i].quantity; j++) {
                    const ticketNumber = `${data.eventId}-${crypto.randomBytes(24).toString('hex')}`
                    const ticketId = new mongoose.Types.ObjectId()
                    // console.log({newTicketNumber: ticketNumber})
                    const checkInToken = crypto.randomBytes(16).toString('hex')
                    if (!ticketId) {
                        return NextResponse.json({ error: "A ticket ID is required" },
                            { status: 500 })
                    }
                    const previewUrl = `${getBaseUrl()}/tickets/p/${checkInToken}`
                    const qrCode = await QRCode.toDataURL(previewUrl)

                    // console.log({printNow: tickets[i], j, i})

                    _createdTickets.push({
                        _id: ticketId,
                        checkInToken,
                        event: data.eventId,
                        createdBy: userId,
                        stand: tickets[i].name,
                        price: tickets[i].price,
                        ticketNumber: `${data.eventId}-${Date.now()}-${j}XC10-SBM`,
                    })
                }
            }
            await Ticket.insertMany(_createdTickets)

            return NextResponse.json({
                message: "Ticket created successfully",
                tickets: _createdTickets
            })
        }
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to create ticket: " + error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        await connectDB();
        const user = await getUserFromCookie();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get("eventId");

        if (!eventId) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        const result = await Ticket.deleteMany({
            event: eventId,
            createdBy: user.id
        });

        return NextResponse.json({
            success: true,
            message: `Deleted ${result.deletedCount} tickets successfully.`,
            deletedCount: result.deletedCount
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to delete tickets: " + error.message },
            { status: 500 }
        );
    }
}
