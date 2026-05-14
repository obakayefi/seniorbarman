import crypto from 'crypto'
import { NextResponse } from 'next/server'
import axios from 'axios'
import Ticket from '@/models/Ticket'
import { connectDB } from '@/lib/mongodb'
import EventApplication from '@/models/EventApplication'
import User from '@/models/User'
import mongoose from 'mongoose'

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

            // Handle event application fee payment
            if (metadata?.type === "event_application") {
                const application = await EventApplication.findOneAndUpdate(
                    {
                        event: metadata.eventId,
                        user: metadata.userId,
                        paymentRef: data.reference,
                    },
                    {
                        paymentStatus: "paid",
                        status: "pending_form",
                    },
                    { new: true }
                ).populate('event user');

                if (application) {
                    const event = application.event as any;
                    const applicant = application.user as any;
                    const organizer = await mongoose.model("User").findById(event.createdBy);

                    if (organizer) {
                        const { notifyOrganizerOfPayment } = await import('@/lib/notifications');
                        await notifyOrganizerOfPayment({
                            organizerEmail: organizer.email,
                            organizerName: organizer.firstName || organizer.username,
                            organizerId: organizer._id.toString(),
                            eventTitle: event.title || 'Event',
                            applicantName: `${applicant.firstName} ${applicant.lastName}`,
                            amount: verified.amount / 100
                        });
                    }
                }
            }
        }
    }

    return NextResponse.json({ received: true })
}