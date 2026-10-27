import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import axios from 'axios'
import TicketOrder from "@/models/TicketOrder";
import Ticket from "@/models/Ticket";
import { getUserFromCookie } from "@/lib/auth";
import { generateTickets } from "@/services/ticketService";

export async function POST(req: Request) {
    await connectDB()
    const { eventId, tickets, reference } = await req.json()
    const user = await getUserFromCookie()

    try {
        const newTicketOrder = await TicketOrder.create({
            tickets,
            event: eventId,
            user: user?.id,
            reference,
            paymentStatus: 'pending'
        })
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

        const ticketOrder = await TicketOrder.findOne({ reference })

        if (!ticketOrder) {
            return NextResponse.json({ error: "Ticket order not found" }, { status: 404 })
        }

        // If tickets have already been generated, return the existing generated tickets idempotently
        if (ticketOrder.isGenerated) {
            const existingTickets = await Ticket.find({
                $or: [
                    { "payment.reference": reference },
                    { event: ticketOrder.event, createdBy: ticketOrder.user }
                ]
            }).populate('event');

            return NextResponse.json({ createdTickets: existingTickets }, { status: 200 })
        }

        // Atomic lock check: only update if isGenerated is still false
        const claimedOrder = await TicketOrder.findOneAndUpdate(
            { _id: ticketOrder._id, isGenerated: false },
            { $set: { isGenerated: true } },
            { new: true }
        );

        if (!claimedOrder) {
            // Concurrent request already claimed ticket generation, fetch created tickets
            const existingTickets = await Ticket.find({
                $or: [
                    { "payment.reference": reference },
                    { event: ticketOrder.event, createdBy: ticketOrder.user }
                ]
            }).populate('event');

            return NextResponse.json({ createdTickets: existingTickets }, { status: 200 })
        }

        const userId = ticketOrder.user?.toString() || user?.id || "";

        const result = await generateTickets({
            eventId: ticketOrder.event.toString(),
            userId,
            batches: ticketOrder.tickets,
            paymentReference: reference,
            isPaid: true,
            generatedBy: 'online-sale'
        });

        return NextResponse.json({ createdTickets: result.tickets }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}