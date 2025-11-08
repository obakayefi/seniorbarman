import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken'
import { Resend } from 'resend'
import QRCode from 'qrcode'
import axios from "axios";
import api from "@/lib/axios";
import crypto from 'crypto'
import Ticket from "@/models/Ticket";

const resend = new Resend(process.env.RESEND_API_KEY)

// export async function POST(req: Request) {
//     // try {

//     // } catch (error: any) {

//     // }
//     NextResponse.json({
//         message: "Hello There!"
//     })

// }

export async function GET() {
    try {
        await connectDB();

        // Get token from cookies
        const token = (await cookies()).get("token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized: No token provided" },
                { status: 401 }
            );
        }
        // Decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        const userId = decoded.id;


        // Fetch events created by this user
        const tickets = await Ticket
            .find({ createdBy: userId })
            .populate("event")
        console.log({ serverTickets: tickets, userId })
        // Handle case where user has no events
        if (!tickets.length) {
            return NextResponse.json({
                message: "No tickets found for this user",
                tickets: [],
            });
        }

        return NextResponse.json({
            message: "tickets fetched successfully",
            tickets,
        });
    } catch (error) {
        console.error("Error fetching user events:", error);
        return NextResponse.json(
            { error: "Failed to fetch events" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json()

        const token = (await cookies()).get('token')?.value

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const userId = decoded.id

        const event = await Event.findById(data.eventId)
        let _createdTickets = []

        let totalTickets = 0

        data.ticketsToPurchase.forEach((ticket) => {
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
                    const checkInToken = crypto.randomBytes(16).toString('hex')
                    const qrPayload = {
                        event: data.eventId,
                        createdBy: userId,
                        stand: tickets[i].name,
                        checkInToken,
                        price: tickets[i].price,
                        ticketNumber: `${data.eventId}-${Date.now()}-${j}XSX`,
                    }

                    const qrCode = await QRCode.toDataURL(JSON.stringify(qrPayload))

                    console.log({ printNow: tickets[i], j, i })
                    _createdTickets.push({
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


    } catch (error) {
        return NextResponse.json(
            { error: "Failed to create ticket: " + error.message },
            { status: 500 }
        )
    }
}
