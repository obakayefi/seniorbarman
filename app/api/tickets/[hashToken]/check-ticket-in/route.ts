import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Event from "@/models/Event"
import { TicketPayload } from "@/types/data";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "@/models/User";
import { PrepareEventStats } from "@/lib/utils";
import { emitWebhook } from "@/services/webhookService";
import eventBus from "@/lib/eventbus";
import { redis } from "@/lib/redis";
import { getUserFromCookie } from "@/lib/auth";

type Params = {
    params: Promise<{ hashToken: string }>;
};

const ProcessLogsForGameStats = (tickets: { checkInLogs: [] }[], gateAction: any) => {
    //console.log({forLogs: events.splice(0, 5)});
    let totalOutsideStadium = 0;
    let totalInsideStadium = 0;
    let totalCheckedIn = 0;

    const _ticketsCheckedIn = tickets.filter(event => event.checkInLogs.length > 0);
    totalCheckedIn = _ticketsCheckedIn.length;

    /*
    * check all tickets with logs
    * 
    * pick the last log on each ticket and if the action is exit add count of those outsideStadium
    * else if the action is entry increase totalinside
    * */

    return {
        allPurchasedTickets: tickets.length,
    };
}


export async function POST(req: Request, { params }: Params) {
    try {
        await connectDB();
        User.init(); // Prevents Next.js 15 from tree-shaking the User model before .populate()
        
        const { hashToken } = await params;
        const body = await req.json().catch(() => ({}));
        const { eventId } = body;

        if (!hashToken) {
            return NextResponse.json(
                { error: "Invalid action" },
                { status: 400 }
            );
        }
        let ticket = await Ticket.findOne({ checkInToken: hashToken }).populate({ path: "event", populate: [{ path: "homeTeam" }, { path: "awayTeam" }] }).populate("createdBy");

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

        // Validation: Cannot check in if already inside
        if (ticket.isInside) {
            const lastLog = ticket.checkInLogs[ticket.checkInLogs.length - 1];
            const lastAction = lastLog?.action || "unknown";
            const lastTime = lastLog?.time ? new Date(lastLog.time).toLocaleString() : "unknown";

            return NextResponse.json(
                {
                    error: "Cannot check in - User already inside",
                    details: {
                        message: "This ticket holder is already checked into the venue and has not checked out.",
                        suggestion: "Check them out first before checking in again, or verify if this is a duplicate scan.",
                        ticketStatus: "Already Inside",
                        lastAction: lastAction,
                        lastActionTime: lastTime,
                        canCheckOut: true,
                        ticket: ticket
                    }
                },
                { status: 400 }
            );
        }

        const user = await getUserFromCookie();

        const gateAction = {
            time: new Date(),
            action: "entry",
            method: "QR Code",
            location: "Gate 1",
            performedBy: user?.id
        }
        ticket.isInside = true;
        ticket.checkInLogs.push(gateAction)
        await ticket.save()

        // Fetch event tickets and calculate stats in parallel
        const ticketsForEvent = await Ticket.find({ event: ticket.event })
        const eventTicketStats = PrepareEventStats(ticketsForEvent);

        // emitWebhook("ticket.check_in", {
        //     ticketId: ticket._id,
        //     userId: ticket,
        //     eventId: ticket.event,
        //     stand: ticket.stand,
        //     location: gateAction.location,
        //     method: gateAction.method,
        // })

        console.log('Before Emission', ticket.event)

        // eventBus.emit(`event_update:${ticket.event}`, {
        //     type: "ticket.check_in",
        //     ticket: ticket,
        //     eventTicketStats
        // });
        const payload = {
            type: "new_scan",
            eventId: ticket.event._id.toString(),
            scan: {
                time: new Date().toLocaleTimeString(),
                userName: ticket.createdBy?.firstName || "Unknown User",
                stand: ticket.stand || "General",
                status: "IN",
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
            console.log('After Emission', { payload })
        } catch (pubErr: any) {
            // Prevent Upstash Network Drops from crashing the actual Ticket check-in!!
            console.error("Non-fatal: Failed to broadcast to Live Dashboard", pubErr)
            await import('@/lib/errorLogger').then(m => m.logSilentError(
                 "Redis Broadcast Failure (Check-In)",
                 pubErr.message,
                 "/api/tickets/[hash]/check-ticket-in",
                 pubErr.stack
            ));
        }

        return NextResponse.json(
            {
                message: "Ticket successfully checked in",
                result: { ticket: ticket, eventTicketStats }
            },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error checking in ticket:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
