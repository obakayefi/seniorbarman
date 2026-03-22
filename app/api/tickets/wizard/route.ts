import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getUserFromCookie } from "@/lib/auth";
import crypto from 'crypto';
import mongoose from "mongoose";

const MAX_TICKETS_PER_REQUEST = 400;

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
        const { eventId, batches, holderName } = body;

        console.log('[WIZARD GENERATE] Request body:', { eventId, batches, holderName });

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

        const ticketOwnerId = user.id || user._id;
        const _createdTickets = [];
        const batchId = crypto.randomUUID();

        for (const batch of batches) {
            const { quantity, stand } = batch;
            const numQuantity = Number(quantity);
            const price = 0; // Price to be determined by sellers
            
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
                        reference: `ADMIN-WIZARD-${batchId}`,
                        authorizationUrl: 'N/A'
                    },
                    holderName: holderName || "Guest",
                    batchId: batchId,
                    isInside: false,
                    isPrinted: false,
                    generatedBy: 'gate-sale' // Explicitly set as per user request
                });
            }
        }

        const savedTickets = await Ticket.insertMany(_createdTickets);

        // Populate event details so the frontend preview has everything it needs
        const populatedTickets = await Ticket.find({ _id: { $in: savedTickets.map(t => t._id) } }).populate('event');

        return NextResponse.json({
            success: true,
            message: `Successfully generated ${totalQuantity} tickets`,
            tickets: populatedTickets,
            batchId
        }, { status: 201 });

    } catch (error: any) {
        console.error("Wizard Generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate tickets: " + error.message },
            { status: 500 }
        );
    }
}
