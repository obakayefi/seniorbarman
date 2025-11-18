import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import axios from "axios";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const reference = searchParams.get("reference")

        if (!reference) {
            return NextResponse.json({ error: "Reference missing" }, { status: 400 })
        }

        const paystackRes = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: { Authorization: `Bearer ${process.env.PAYSTACK_API_KEY}` }
            }
        )

        const transaction = { message: paystackRes.data.message, data: paystackRes.data.data }
        return NextResponse.json(
            { status: transaction.data.status, message: transaction.message },
            { status: 200 }
        )
    } catch (error: any) {
        console.error()
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}