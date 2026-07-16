import { NextResponse } from 'next/server'
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import Event from "@/models/Event";
import { PrepareEventStats } from "@/lib/utils";
import { redis } from "@/lib/redis";
import { getUserFromCookie } from "@/lib/auth";

type Params = {
    params: Promise<{ hashToken: string }>
}

export async function POST(req: Request, { params }: Params) {
    try {
        await connectDB()
        User.init(); // Prevents Next.js 15 from tree-shaking the User model before .populate()

        const { hashToken } = await params
        const body = await req.json().catch(() => ({}));
        const { eventId } = body;

        const user = await getUserFromCookie();

        const gateAction = {
            action: "exit",
            method: "QR Code",
            time: new Date(),
            location: "Gate 1",
            performedBy: user?.id
        }

        //  console.log({hashToken, gateAction})

        if (!hashToken) {
            return NextResponse.json(
                { error: "Invalid hash token" },
                { status: 400 }
            )
        }

        let ticket = await Ticket.findOne({ checkInToken: hashToken }).populate({ path: "event", populate: [{ path: "homeTeam" }, { path: "awayTeam" }] }).populate("createdBy")

        if (!ticket) {
            return NextResponse.json(
                { error: "Ticket not found" },
                { status: 404 }
            );
        }

        // Validation: Event Mismatch
        if (eventId && ticket.event?._id?.toString() !== eventId) {
            return NextResponse.json(
                {
                    error: "Event Mismatch",
                    details: {
                        message: "This ticket is registered for a different event.",
                        suggestion: "Ensure you have selected the correct event in the scanner deployment menu.",
                        ticketStatus: "Invalid Event",
                        ticket: ticket
                    }
                },
                { status: 400 }
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

        const payload = {
            type: "new_scan",
            eventId: ticket.event._id.toString(),
            scan: {
                time: new Date().toLocaleTimeString(),
                userName: ticket.createdBy?.firstName || "Unknown User",
                stand: ticket.stand || "General",
                status: "OUT",
                success: true
            },
            eventTicketStats
        };

        try {
            const publishPromise = redis.publish(`event_update:${ticket.event._id.toString()}`, JSON.stringify(payload));
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Redis broadcast timeout exceeded (5s)")), 5000)
            );
            
            await Promise.race([publishPromise, timeoutPromise]);
        } catch (pubErr: any) {
             console.error("Non-fatal: Failed to broadcast check-out to Live Dashboard", pubErr);
             await import('@/lib/errorLogger').then(m => m.logSilentError(
                 "Redis Broadcast Failure (Check-Out)",
                 pubErr.message,
                 "/api/tickets/[hash]/check-ticket-out",
                 pubErr.stack
             ));
        }

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