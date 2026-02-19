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
        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: "Unauthorized: Admin access required" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { eventId, quantity, type, price, stand, holderName, targetUserId } = body;

        console.log('[GENERATE] Request body:', { eventId, quantity, type, price, stand, holderName, targetUserId });

        if (!eventId || !quantity || !price) {
            console.error('[GENERATE] Validation failed:', { eventId: !!eventId, quantity: !!quantity, price: !!price });
            return NextResponse.json(
                { error: "Missing required fields", details: { eventId: !!eventId, quantity: !!quantity, price: !!price } },
                { status: 400 }
            );
        }

        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || numQuantity <= 0) {
            return NextResponse.json(
                { error: "Invalid quantity" },
                { status: 400 }
            );
        }

        // Determine ticket owner
        // If targetUserId is provided and user is admin, use targetUserId
        // Otherwise use the requesting user's ID
        let ticketOwnerId = user.id || user._id;
        if (targetUserId && user.role === 'admin') {
            ticketOwnerId = targetUserId;
            console.log(`[GENERATE] Admin generating tickets for target user: ${targetUserId}`);
        }

        const _createdTickets = [];
        const batchId = crypto.randomUUID(); // Unique ID for this batch

        // Generate tickets
        for (let i = 0; i < numQuantity; i++) {
            const ticketId = new mongoose.Types.ObjectId();
            const checkInToken = crypto.randomBytes(16).toString('hex');

            // Generate a simpler readable ticket number for the print
            const uniqueSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
            const shortTicketNumber = `${uniqueSuffix}`;

            _createdTickets.push({
                _id: ticketId,
                checkInToken,
                event: eventId,
                createdBy: ticketOwnerId,
                stand: stand || "Regular",
                price: Number(price),
                ticketNumber: `${eventId.slice(-4)}-${Date.now().toString().slice(-6)}-${shortTicketNumber}`,
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

        await Ticket.insertMany(_createdTickets);

        return NextResponse.json({
            success: true,
            message: `Successfully generated ${numQuantity} tickets`,
            tickets: _createdTickets,
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
