import {NextApiResponse} from "next";
import {connectDB} from "@/lib/mongodb";
import {NextResponse} from "next/server";
import {verifyAuth} from "@/lib/auth";
import Ticket from "@/models/Ticket";
import User from "@/models/User"

export async function GET(req: Request) {
    try {
        await connectDB();
        await verifyAuth()

        const { searchParams } = new URL(req.url);
        const hash = searchParams.get("hash");
        const ticket = await Ticket.findOne({checkInToken: hash}).populate("event")
        const user = await User.findById(ticket.createdBy)

        console.log({hash, ticket, user}) 
        
        return NextResponse.json({
            message: "Ticket found",
            result: {
                ticket,
                createdBy: user
            }
        })
    } catch (e: any) {
        console.error("Error fetching user events:", e);
        return NextResponse.json(
            {error: "Failed to fetch events"},
            {status: 500}
        );
    }
}

export async function PATCH(req: Request) {
    try {
        await connectDB();
        await verifyAuth()
        
        // here we use the ticket hash to find the right ticket
        // we then         
        return NextResponse.json(
            {message: "PATCH events", status: 200},
        )
    } catch (e) {
        return NextResponse.json(
            {error: "Failed to fetch events"},
            {status: 500}
        )
    }
}