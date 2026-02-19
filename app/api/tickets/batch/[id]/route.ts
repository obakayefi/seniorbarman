import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getUserFromCookie } from "@/lib/auth";

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

        const { id: batchId } = await params;

        const tickets = await Ticket.find({ batchId: batchId }).populate('event');

        return NextResponse.json({
            success: true,
            tickets
        });

    } catch (error: any) {
        console.error("Batch ticket fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch tickets: " + error.message },
            { status: 500 }
        );
    }
}
