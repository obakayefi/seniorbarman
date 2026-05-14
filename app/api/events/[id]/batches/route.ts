import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getUserFromCookie } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: Request, { params }: { params: { id: string } }) {
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

        const { id: eventId } = await params;

        // Verify event ownership for organizer
        if (user.role === 'organizer') {
            const event = await mongoose.model('Event').findById(eventId);
            if (!event || event.createdBy?.toString() !== user.id) {
                return NextResponse.json({ error: "Forbidden: Not your event" }, { status: 403 });
            }
        }

        // Aggregate to find batches
        // We want: batchId, count, createdAt (min), holderName (first), isPrinted (any)
        const batches = await Ticket.aggregate([
            { $match: { event: new mongoose.Types.ObjectId(eventId), batchId: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: "$batchId",
                    count: { $sum: 1 },
                    createdAt: { $min: "$createdAt" },
                    holderName: { $first: "$holderName" },
                    stand: { $first: "$stand" },
                    price: { $first: "$price" },
                    isPrinted: { $max: "$isPrinted" } // If any is printed, we can show it (or use $min for all)
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return NextResponse.json({
            success: true,
            batches
        });

    } catch (error: any) {
        console.error("Batch fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch batches: " + error.message },
            { status: 500 }
        );
    }
}
