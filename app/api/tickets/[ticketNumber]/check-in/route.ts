import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

type Params = {
    params: Promise<{ ticketNumber: string }>;
};

export async function POST(req: Request, { params }: Params) {
    try {
        await connectDB();

        const { ticketNumber } = await params;

        if (!ticketNumber) {
            return NextResponse.json(
                { error: "Ticket number is required" },
                { status: 400 }
            );
        }

        let ticket = await Ticket.findById(ticketNumber).populate("event");

        if (!ticket) {
            return NextResponse.json(
                { error: "Ticket not found" },
                { status: 404 }
            );
        }

        if (ticket.status === "Checked In") {
            return NextResponse.json(
                { error: "Ticket has already been checked in" },
                { status: 400 }
            );
        }

        // update and return updated document
        // const updatedTicket = await Ticket.findByIdAndUpdate(ticketNumber,
        //     { status: "Checked In" },
        //     { new: true }
        // ).populate("event");
        // console.log({ updatedTicket });

        ticket.checkInLogs.push({
            time: new Date(),
            location: "Gate 1",
            method: "QR Scan"
        })

        await ticket.save()


        return NextResponse.json({
            message: "Ticket successfully checked in",
            ticket: ticket.toObject({ virtuals: true }),
        });
    } catch (error) {
        console.error("Error checking in ticket:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
