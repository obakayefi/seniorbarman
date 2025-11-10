import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { cookies } from "next/headers";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import Event from "@/models/Event";


type Params = {
    params: Promise<{ ticketNumber: string }>;
};

export async function GET(req: Request, { params }: Params) {
    try {
        await connectDB();

        const token = (await cookies()).get("token")?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized: No token provided" },
                { status: 401 }
            );
        }

        // ✅ Await params directly — not props.context.params
        const { ticketNumber } = await params;

        console.log("Ticket number:", ticketNumber);

        const ticket = await Ticket.findById(ticketNumber);
        const user = await User.findById(ticket.createdBy)
        const event = await Event.findById(ticket.event)

        if (!ticket) {
            return NextResponse.json(
                { error: "Ticket not found" },
                { status: 404 }
            );
        }
        const response = {
            event,
            user: `${user.firstName} ${user.lastName}`,
            ticket
        }

        console.log({ response })

        return NextResponse.json(
            { message: "Ticket found", response },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
