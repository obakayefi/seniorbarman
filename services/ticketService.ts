import mongoose from "mongoose";
import crypto from "crypto";
import Ticket from "@/models/Ticket";
import { connectDB } from "@/lib/mongodb";

export interface TicketBatchInput {
    stand?: string;
    name?: string;
    quantity: number;
    price?: number;
}

export interface GenerateTicketsParams {
    eventId: string;
    userId: string;
    batches: TicketBatchInput[];
    paymentReference?: string;
    isPaid?: boolean;
    generatedBy?: 'wizard' | 'online-sale' | 'third-party' | 'store-sale' | 'gate-sale';
    holderName?: string;
    batchId?: string;
}

export interface GenerateTicketsResult {
    success: boolean;
    tickets: any[];
    batchId: string;
    totalGenerated: number;
}

/**
 * Centralized, reusable ticket generation service method.
 * Handles ticket document creation, unique token generation, and DB insertion.
 */
export async function generateTickets(params: GenerateTicketsParams): Promise<GenerateTicketsResult> {
    await connectDB();

    const {
        eventId,
        userId,
        batches,
        paymentReference,
        isPaid = true,
        generatedBy = 'online-sale',
        holderName = 'Guest',
        batchId: inputBatchId
    } = params;

    if (!eventId || !userId || !batches || !Array.isArray(batches) || batches.length === 0) {
        throw new Error("Missing required parameters for ticket generation");
    }

    const batchId = inputBatchId || crypto.randomUUID();
    const createdTicketsPayload: any[] = [];
    let totalGenerated = 0;

    const eventIdStr = eventId.toString();

    for (const batch of batches) {
        const quantity = Number(batch.quantity || 0);
        if (quantity <= 0) continue;

        const standName = batch.stand || batch.name || "Regular";
        const ticketPrice = Number(batch.price) || 0;

        for (let i = 0; i < quantity; i++) {
            const ticketId = new mongoose.Types.ObjectId();
            const checkInToken = crypto.randomBytes(16).toString('hex');
            const uniqueSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();

            // Collision-resistant ticket number format
            const ticketNumber = `${eventIdStr.slice(-4)}-${Date.now().toString().slice(-6)}-${uniqueSuffix}`;

            createdTicketsPayload.push({
                _id: ticketId,
                checkInToken,
                event: eventId,
                createdBy: userId,
                ticketType: {
                    name: standName,
                    price: ticketPrice
                },
                stand: standName,
                price: ticketPrice,
                ticketNumber,
                payment: {
                    status: isPaid ? 'success' : 'pending',
                    reference: paymentReference || `GEN-${batchId}`,
                    authorizationUrl: 'N/A'
                },
                holderName: holderName || "Guest",
                batchId,
                isInside: false,
                isPrinted: false,
                generatedBy
            });

            totalGenerated++;
        }
    }

    if (createdTicketsPayload.length === 0) {
        return {
            success: true,
            tickets: [],
            batchId,
            totalGenerated: 0
        };
    }

    const savedTickets = await Ticket.insertMany(createdTicketsPayload);

    // Populate event details so response has rich data
    const populatedTickets = await Ticket.find({
        _id: { $in: savedTickets.map(t => t._id) }
    }).populate('event');

    return {
        success: true,
        tickets: populatedTickets,
        batchId,
        totalGenerated
    };
}
