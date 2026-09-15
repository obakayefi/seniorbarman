import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getUserFromCookie } from "@/lib/auth";
import crypto from 'crypto';
import mongoose from "mongoose";
import { generateTickets } from "@/services/ticketService";

export async function POST(req: Request) {
    try {
        await connectDB();

        // Auth Check
        const user = await getUserFromCookie();
        if (!user || !['admin', 'dev', 'organizer'].includes(user.role)) {
            return NextResponse.json(
                { error: "Unauthorized: Access required" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { eventId, quantity, type, price, stand, holderName, targetUserId } = body;

        // Verify event ownership if user is organizer
        if (user.role === 'organizer') {
            const event = await mongoose.model('Event').findById(eventId);
            if (!event || event.createdBy?.toString() !== user.id) {
                return NextResponse.json({ error: "Forbidden: You can only generate tickets for your own events" }, { status: 403 });
            }
        }

        // console.log('[GENERATE] Request body:', { eventId, quantity, type, price, stand, holderName, targetUserId });

        // Robust validation: check for null, undefined, or empty strings for mandatory fields
        const isMissingEvent = !eventId;
        const isMissingQuantity = quantity === undefined || quantity === null || quantity === '';
        const isMissingPrice = price === undefined || price === null || price === '';

        if (isMissingEvent || isMissingQuantity || isMissingPrice) {
            console.error('[GENERATE] Validation failed:', { isMissingEvent, isMissingQuantity, isMissingPrice });
            return NextResponse.json(
                {
                    error: "Missing required fields",
                    details: {
                        eventId: !isMissingEvent,
                        quantity: !isMissingQuantity,
                        price: !isMissingPrice
                    }
                },
                { status: 400 }
            );
        }

        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || numQuantity <= 0) {
            return NextResponse.json(
                { error: "Quantity must be a number greater than 0" },
                { status: 400 }
            );
        }

        if (numQuantity >= 400) {
            return NextResponse.json(
                { error: "Bulk Ticket Generation Initiated" },
                { status: 200 }
            );
        }

        // Determine ticket owner
        let ticketOwnerId = (user.id || user._id).toString();
        if (targetUserId && (user.role === 'admin' || user.role === 'dev')) {
            ticketOwnerId = targetUserId.toString();
        }

        const batchId = crypto.randomUUID();

        const result = await generateTickets({
            eventId: eventId.toString(),
            userId: ticketOwnerId,
            batches: [{
                stand: stand || "Regular",
                quantity: numQuantity,
                price: Number(price)
            }],
            paymentReference: `ONLINE-GEN-${batchId}`,
            isPaid: true,
            generatedBy: 'online-sale',
            holderName: holderName || "Guest",
            batchId
        });

        return NextResponse.json({
            success: true,
            message: `Successfully generated ${numQuantity} tickets`,
            tickets: result.tickets,
            batchId: result.batchId
        }, { status: 201 });

    } catch (error: any) {
        console.error("Ticket generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate tickets: " + error.message },
            { status: 500 }
        );
    }
}
