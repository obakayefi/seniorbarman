import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getUserFromCookie } from "@/lib/auth";
import crypto from 'crypto';
import mongoose from "mongoose";

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

        console.log('[GENERATE] Request body:', { eventId, quantity, type, price, stand, holderName, targetUserId });

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
        let ticketOwnerId = user.id || user._id;
        if (targetUserId && (user.role === 'admin' || user.role === 'dev')) {
            ticketOwnerId = targetUserId;
            console.log(`[GENERATE] Admin generating tickets for target user: ${targetUserId}`);
        }

        const _createdTickets = [];
        const batchId = crypto.randomUUID();

        for (let i = 0; i < numQuantity; i++) {
            const ticketId = new mongoose.Types.ObjectId();
            const checkInToken = crypto.randomBytes(16).toString('hex');
            const uniqueSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();

            _createdTickets.push({
                _id: ticketId,
                checkInToken,
                event: eventId,
                createdBy: ticketOwnerId,
                stand: stand || "Regular",
                price: Number(price),
                ticketNumber: `${eventId.toString().slice(-4)}-${Date.now().toString().slice(-6)}-${uniqueSuffix}`,
                payment: {
                    status: 'success',
                    reference: `ADMIN-GEN-${batchId}`,
                    authorizationUrl: 'N/A'
                },
                holderName: holderName || "Guest",
                batchId: batchId,
                isInside: false,
                isPrinted: false
            });
        }

        const savedTickets = await Ticket.insertMany(_createdTickets);

        // Populate event details so the frontend preview has everything it needs
        const populatedTickets = await Ticket.find({ _id: { $in: savedTickets.map(t => t._id) } }).populate('event');

        return NextResponse.json({
            success: true,
            message: `Successfully generated ${numQuantity} tickets`,
            tickets: populatedTickets,
            batchId
        }, { status: 201 });

    } catch (error: any) {
        console.error("Ticket generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate tickets: " + error.message },
            { status: 500 }
        );
    }
}
