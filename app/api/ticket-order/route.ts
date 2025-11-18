import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import axios from 'axios'
import TicketOrder from "@/models/TicketOrder";
import { getUserFromCookie } from "@/lib/auth";
import { PrintTickets } from "../tickets/route";
import Ticket from "@/models/Ticket";


export async function POST(req: Request) {
    await connectDB()
    const { eventId, tickets, reference } = await req.json()
    const user = await getUserFromCookie()

    console.log({ eventId, tickets, reference })

    try {
        const newTicketOrder = await TicketOrder.create({
            tickets,
            event: eventId,
            user: user?.id,
            reference,
            paymentStatus: 'success'
        })
        console.log({ newTicketOrder })
        return NextResponse.json({ message: "Ticket order created" }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: "Could not get ticket order" }, { status: 400 })
    }
}

export async function GET(req: Request) {
    await connectDB()

    try {
        const user = await getUserFromCookie()
        const { searchParams } = new URL(req.url)
        const reference = searchParams.get("reference")

        if (!reference) {
            return NextResponse.json({ error: "Reference missing" }, { status: 400 })
        }

        const ticketOrders = await TicketOrder.findOne({ reference })

        if (!ticketOrders) {
            return NextResponse.json({ error: "You can't generate tickets like this, sorry" }, { status: 400 })
        }

        console.log({ticketOrders, reference})

        // throw Error if tickets have already been generated
        // if (ticketOrders?.isGenerated) return NextResponse.json({ error: 'Tickets for this order has been generated', }, { status: 400 })   

        const _ticketsToPrint = await PrintTickets(ticketOrders.tickets, ticketOrders.event, true)

        console.log({ ticketOrders, _ticketsToPrint });

        const createdTickets = await Ticket.create(_ticketsToPrint)

        ticketOrders.isGenerated = true
        ticketOrders.save()

        // return NextResponse.json({ message: "Hello" }, { status: 200 })
        return NextResponse.json({ createdTickets }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}