import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { cookies } from "next/headers";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import Event from "@/models/Event";
import jwt, {JwtPayload} from "jsonwebtoken";


type Params = {
    params: Promise<{ hashToken: string }>;
};

export async function GET(req: Request, { params }: Params) {
    try {
        await connectDB();

        const token = (await cookies()).get("token")?.value;

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
        if (typeof decoded === "string") {
            throw Error("Invalid token format");
        }

        const userId = (decoded as JwtPayload).id;
        // const event = await Event.findById(oar);
        // console.log({  });
        
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized: No token provided" },
                { status: 401 }
            );
        }

        // ✅ Await v directly — not props.context.v
        const { hashToken: eventId } = await params;
        
        const event = await Event.findById(eventId);
        const tickets = await Ticket.find({ createdBy: userId });
        if (!tickets) {
            return NextResponse.json(
                { error: "Could not find event for this ticket" },
                { status: 404 }
            );
        }

        const response = {
            event,
            tickets
        }
        console.log("Ticket number:", {event, tickets});
        // const response = {
        //     tickets,
        // }
        //
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
