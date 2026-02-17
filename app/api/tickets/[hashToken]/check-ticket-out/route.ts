import { NextResponse } from 'next/server'
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import Event from "@/models/Event";
import { PrepareEventStats } from "@/lib/utils";
import eventBus from "@/lib/eventbus";

type Params = {
    params: Promise<{ hashToken: string }>
}

export async function POST(req: Request, { params }: Params) {
    try {
        await connectDB()
        const { hashToken } = await params

        const gateAction = {
            action: "exit",
            method: "QR Code",
            time: new Date(),
            location: "Gate 1"
        }

        //  console.log({hashToken, gateAction})

        if (!hashToken) {
            return NextResponse.json(
                { error: "Invalid hash token" },
                { status: 400 }
            )
        }

        let ticket = await Ticket.findOne({ checkInToken: hashToken }).populate("event").populate("createdBy")

        if (!ticket) {
            return NextResponse.json(
                { error: "Ticket not found" },
                { status: 404 }
            );
        }

        // Validation: Cannot check out if not checked in
        if (!ticket.isInside) {
            return NextResponse.json(
                {
                    error: "Cannot check out - User not checked in",
                    details: {
                        message: "This ticket holder was never checked into the venue.",
                        suggestion: "Verify the ticket status. If this is an error, contact support or void the ticket.",
                        ticketStatus: "Not Inside",
                        canVoid: true,
                        ticket: ticket
                    }
                },
                { status: 400 }
            );
        }

        ticket.isInside = false;
        ticket.checkInLogs.push(gateAction)
        await ticket.save()

        // Fetch event tickets and calculate stats
        const ticketsForEvent = await Ticket.find({ event: ticket.event })
        const eventTicketStats = PrepareEventStats(ticketsForEvent);

        eventBus.emit(`event_update:${ticket.event}`, {
            type: "ticket.check_out",
            ticket: ticket,
            eventTicketStats
        });

        return NextResponse.json(
            {
                message: "Checking User Out",
                result: { ticket: ticket, eventTicketStats }
            },
            { status: 200 }
        )
    } catch (e: any) {
        return NextResponse.json(
            { error: "Error checking user out" }
        )
    }
}