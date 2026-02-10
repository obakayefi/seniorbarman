import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Event from "@/models/Event";
import User from "@/models/User";
import { getUserFromCookie } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: Request) {
    try {
        await connectDB();
        const user = await getUserFromCookie();

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const query = (searchParams.get("q") || "").trim();

        if (!query) {
            return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
        }

        let ticket;

        // Try searching by ID if it's a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(query)) {
            ticket = await Ticket.findById(query);
        }

        // If not found by ID, try searching by checkInToken
        if (!ticket) {
            ticket = await Ticket.findOne({ checkInToken: query });
        }

        // If not found, try searching by ticketNumber
        if (!ticket) {
            ticket = await Ticket.findOne({ ticketNumber: query });
        }

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        // Populate details
        const event = await Event.findById(ticket.event);
        const creator = await User.findById(ticket.createdBy);

        return NextResponse.json({
            ticket,
            event,
            user: creator
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error searching ticket:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
