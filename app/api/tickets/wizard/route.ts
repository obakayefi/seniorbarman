import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getUserFromCookie } from "@/lib/auth";
import crypto from 'crypto';
import mongoose from "mongoose";

import Event from "@/models/Event";
import { hasManagerAccessToTeams } from "@/services/teamService";
import { generateTickets } from "@/services/ticketService";

const MAX_TICKETS_PER_REQUEST = 400;

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { eventId, batches, holderName } = body;

        // Auth Check
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const isAdminOrDev = user.role === 'admin' || user.role === 'dev';

        if (!isAdminOrDev) {
            const event = await Event.findById(eventId).lean() as any;
            if (!event) {
                return NextResponse.json({ error: "Event not found" }, { status: 404 });
            }

            const isOwner = event.createdBy?.toString() === user.id;
            let isTeamManagerAllowed = false;

            if (user.role === 'team_manager') {
                isTeamManagerAllowed = await hasManagerAccessToTeams(user.id, [event.homeTeam?.toString(), event.awayTeam?.toString()]);
            }

            if (!isOwner && !isTeamManagerAllowed) {
                return NextResponse.json(
                    { error: "Forbidden: You are not authorized for this event" },
                    { status: 403 }
                );
            }
        }

        // console.log('[WIZARD GENERATE] Request body:', { eventId, batches, holderName });

        if (!eventId || !batches || !Array.isArray(batches) || batches.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields or invalid batches" },
                { status: 400 }
            );
        }

        // Calculate total quantity and validate batches
        let totalQuantity = 0;
        for (const batch of batches) {
            const { quantity, stand } = batch;
            const numQty = Number(quantity);
            if (isNaN(numQty) || numQty <= 0) {
                return NextResponse.json({ error: `Invalid quantity for stand: ${stand}` }, { status: 400 });
            }
            totalQuantity += numQty;
        }

        if (totalQuantity > MAX_TICKETS_PER_REQUEST) {
            return NextResponse.json(
                { error: `Cannot generate more than ${MAX_TICKETS_PER_REQUEST} tickets per request` },
                { status: 400 }
            );
        }

        const ticketOwnerId = (user.id || user._id).toString();
        const batchId = crypto.randomUUID();

        const result = await generateTickets({
            eventId: eventId.toString(),
            userId: ticketOwnerId,
            batches,
            paymentReference: `TICKET_WIZARD-${batchId}`,
            isPaid: true,
            generatedBy: 'wizard',
            holderName: holderName || "Guest",
            batchId
        });

        return NextResponse.json({
            success: true,
            message: `Successfully generated ${result.totalGenerated} tickets`,
            tickets: result.tickets,
            batchId: result.batchId
        }, { status: 201 });

    } catch (error: any) {
        console.error("Wizard Generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate tickets: " + error.message },
            { status: 500 }
        );
    }
}
