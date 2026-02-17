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
        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: "Unauthorized: Admin access required" },
                { status: 401 }
            );
        }

        const eventId = params.id;

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
