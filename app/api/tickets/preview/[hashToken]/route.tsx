import {NextRequest, NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import Event from "@/models/Event"
import Ticket from "@/models/Ticket";
import User from "@/models/User";

export async function GET(request: NextRequest, {params}: { params: { hashToken: string } }) {
    const {hashToken} = await params;

    if (!hashToken) {
        return NextResponse.json({error: "Token is required"}, {status: 400});
    }

    try {
        await connectDB();

        const ticket = await Ticket.findOne({checkInToken: hashToken})
        if (!ticket) {
            return NextResponse.json({error: "Ticket not found"}, {status: 404});
        }
        const event = await Event.findById(ticket.event)
        const user = await User.findById(ticket.createdBy)
        const response = {ticket, event, user}

        return NextResponse.json({...response}, {status: 200});
    } catch (error: any) {
        console.error("Error fetching ticket:", error);
        return NextResponse.json({error: "Server error"}, {status: 500});
    }
}
