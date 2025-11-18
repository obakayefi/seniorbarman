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
import mongoose from "mongoose";
import { getUserFromCookie } from "@/lib/auth";
import { StandType } from "@/types/components";

const resend = new Resend(process.env.RESEND_API_KEY)

// export async function POST(req: Request) {
//     // try {

//     // } catch (error: any) {

//     // }
//     NextResponse.json({
//         message: "Hello There!"
//     })

// }



async function SortTicketsForView(events: any[], tickets: any[]) {
    const orderedEvents = events.map((event, idx) => {

        // TODO! Extract keys into referenceable object.
        const ticketSummary: Record<StandType, number> = {
            "Cover Stand Regular": 0,
            "Cover Stand Executive": 0,
            "Popular Stand": 0,
        }
        const ticketsForEvent = tickets.filter(ticket => {
            // console.log({  eventInLoop: event._id.toString(), eventInticketLoop: ticket.event._id.toString() })
            const ticketStand = ticket.stand as StandType
            ticketSummary[ticketStand] += 1
            
            return ticket.event._id.toString() === event._id.toString()
        })
        console.log({ticketsForEvent, ticketSummary});
        return {
            event,
            tickets: ticketsForEvent,
            summary: ticketSummary
        }
    })    

    console.log({orderedEvents});
    
    
    return orderedEvents
}



export async function GET(req: Request) {
    try {
        await connectDB();

        // Get token from cookies
        const token = (await cookies()).get("token")?.value;
        const { searchParams } = new URL(req.url)
        const eventNumber = searchParams.get("event-number")

        console.log({ eventNumber })
        // if (!eventNumber) {
        //     return NextResponse.json({ error: "An event is required" }, { status: 400 })
        // }

        // find all the events 
        // for each event attach the tickets in the db that match it's event id
        // finally only show events that have atleast one ticket
        
        // LOADING SINGLE TICKET
        // use the ticket's ID t
        

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized: No token provided" },
                { status: 401 }
            );
        }
        // Decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, userId: string };
        const userId = decoded.id;


        // Fetch events created by this user
        const tickets = await Ticket
            .find({ createdBy: userId })
            .populate("event")
        // console.log({ serverTickets: tickets, userId })
        // Handle case where user has no events
        if (!tickets.length) {
            return NextResponse.json({
                message: "No tickets found for this user",
                tickets: [],
            });
        }

        const events = await Event.find({})

        const eventsSortedWithTickets = await SortTicketsForView(events, tickets)


        return NextResponse.json({
            message: "tickets fetched successfully",
            tickets: eventsSortedWithTickets.filter(event => event.tickets.length !== 0),
            
        });
    } catch (error) {
        console.error("Error fetching user events:", error);
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
    console.log({ nowTickets: tickets })

    for (let i = 0; i < tickets.length; i++) {
        // console.log({ singleTicket: tickets[i] })
        for (let j = 0; j < tickets[i].quantity; j++) {
            const ticketNumber = `${eventId}-${crypto.randomBytes(24).toString('hex')}`
            const ticketId = new mongoose.Types.ObjectId()
            console.log({ newTicketNumber: ticketNumber })
            const checkInToken = crypto.randomBytes(16).toString('hex')
            if (!ticketId) {
                return NextResponse.json({ error: "A ticket ID is required" },
                    { status: 500 })
            }
            const qrPayload = {
                ticket: ticketId,
                event: eventId,
                createdBy: userId,
                stand: tickets[i].name,
                checkInToken,
                price: tickets[i].price,
                ticketNumber,
            }

            const qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload))

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
                qrCode,
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

        const event = await Event.findById(data.eventId)
        let _createdTickets = []

        let totalTickets = 0

        data.ticketsToPurchase.forEach((ticket: any) => {
            totalTickets += ticket.quantity
        })

        if (totalTickets > 5) {
            // console.log('Bulk tickets are being generated...')
            return NextResponse.json({
                message: "Bulk Tickets Order"
            })
        } else {
            console.log('Few tickets! Wait for your tickets', decoded)

            // prepare the ticket
            const tickets = data.ticketsToPurchase.filter((ticket: any) => ticket.quantity !== 0)
            console.log({ nowTickets: tickets })

            for (let i = 0; i < tickets.length; i++) {
                // console.log({ singleTicket: tickets[i] })
                for (let j = 0; j < tickets[i].quantity; j++) {
                    const ticketNumber = `${data.eventId}-${crypto.randomBytes(24).toString('hex')}`
                    const ticketId = new mongoose.Types.ObjectId()
                    console.log({ newTicketNumber: ticketNumber })
                    const checkInToken = crypto.randomBytes(16).toString('hex')
                    if (!ticketId) {
                        return NextResponse.json({ error: "A ticket ID is required" },
                            { status: 500 })
                    }
                    const qrPayload = {
                        ticket: ticketId,
                        event: data.eventId,
                        createdBy: userId,
                        stand: tickets[i].name,
                        checkInToken,
                        price: tickets[i].price,
                        ticketNumber,
                    }

                    const qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload))

                    console.log({ printNow: tickets[i], j, i })

                    _createdTickets.push({
                        _id: ticketId,
                        checkInToken,
                        event: data.eventId,
                        createdBy: userId,
                        stand: tickets[i].name,
                        price: tickets[i].price,
                        ticketNumber: `${data.eventId}-${Date.now()}-${j}XSX`,
                        qrCode,
                    })
                }
                console.log('tickets_to_print', _createdTickets)
                await Ticket.insertMany(_createdTickets)
            }

            return NextResponse.json({
                message: "Ticket created successfully",
                tickets: _createdTickets
            })
        }


    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to create ticket: " + error.message },
            { status: 500 }
        )
    }
}
