import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import axios from "axios"
import { verifyToken } from "@/lib/jwt";
import Ticket from "@/models/Ticket";
import Event from "@/models/Event";

import { getBaseUrl } from "@/lib/utils";

const PAYSTACK_API_KEY = process.env.PAYSTACK_API_KEY as string;

// ... (other functions)

export async function POST(req: Request) {
    const { eventId, ticketId, email, amount } = await req.json();
    // const body = await req.json();
    try {

        if (!email || !amount) {
            return NextResponse.json(
                { error: "Email and amount are required" },
                { status: 400 }
            )
        }

        if (!eventId) {
            return NextResponse.json(
                { error: "An Event is required" },
                { status: 400 }
            )
        }
        //const foundEvent = await Event.findById(eventId)

        const paystackPayload = {
            email,
            amount: amount * 100, // convert from KOBO to naira,
            callback_url: `${getBaseUrl()}/verify`,
            metadata: {
                type: "ticket",
                eventId,
            }
        }

        const headers = {
            "Authorization": "Bearer " + PAYSTACK_API_KEY,
            "Content-Type": "application/json"
        }

        const response = (await axios.post("https://api.paystack.co/transaction/initialize", paystackPayload, { headers })).data.data
        
        return NextResponse.json(
            {
                message: "Payment initialized successfully",
                redirectTo: response.authorization_url,
                reference: response.reference
            },
            { status: 200 }
        )

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET() {
    return NextResponse.json({ status: "OK" });
}