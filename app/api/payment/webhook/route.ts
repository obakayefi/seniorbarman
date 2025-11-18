import crypto from 'crypto'
import { NextResponse } from 'next/server'
import axios from 'axios'
import Ticket from '@/models/Ticket'
import { connectDB } from '@/lib/mongodb'

export async function POST(req: Request) {
    await connectDB();

    const secret = process.env.PAYSTACK_API_KEY || ""
    const rawBody = await req.text()
    const signature = crypto.createHmac("sha512", secret).update(rawBody).digest("hex")
    
    if (signature !== req.headers.get("x-paystack-signature")) {
        return NextResponse.json({error: "Invalid signature"}, { status: 401 })
    }

    const event = JSON.parse(rawBody) 
    if (event.event === "charge.success") {
        const data = event.data

        const verifyRes = await axios.get(`https://api.paystack.co/transaction/verify/${data.reference}`,
            { headers: { Authorization: `Bearer ${secret}` } }
        )

        const verified = verifyRes.data.data
        if (verified.status === "success") {
            const metadata = verified.metadata

            console.log({verified, metadata})
        }
    }

    return NextResponse.json({ received: true })
}