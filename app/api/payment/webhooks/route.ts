import crypto from 'crypto'
import { NextResponse } from 'next/server'
import axios from 'axios'
import Ticket from '@/models/Ticket'
import { connectDB } from '@/lib/mongodb'
import EventApplication from '@/models/EventApplication'
import User from '@/models/User'
import EventModel from '@/models/Event'
import Team from '@/models/Team'
import mongoose from 'mongoose'

export async function POST(req: Request) {
    await connectDB();
    Team.init();
    EventModel.init();

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
                ).populate({
                    path: 'event',
                    populate: [
                        { path: 'homeTeam', select: 'name logo' },
                        { path: 'awayTeam', select: 'name logo' }
                    ]
                }).populate('user');

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
                            eventTitle: event.title || `${event.homeTeam?.name || event.homeTeam} vs ${event.awayTeam?.name || event.awayTeam}` || 'Event',
                            applicantName: `${applicant.firstName} ${applicant.lastName}`,
                            amount: verified.amount / 100
                        });
                    }
                }
            }
            // Handle ticket order payment
            if (metadata?.type === "ticket" || !metadata?.type) {
                const TicketOrder = (await import("@/models/TicketOrder")).default;
                const ticketOrder = await TicketOrder.findOneAndUpdate(
                    { reference: data.reference },
                    { paymentStatus: "success" },
                    { new: true }
                );

                if (ticketOrder && !ticketOrder.isGenerated) {
                    const claimedOrder = await TicketOrder.findOneAndUpdate(
                        { _id: ticketOrder._id, isGenerated: false },
                        { $set: { isGenerated: true } },
                        { new: true }
                    );

                    if (claimedOrder) {
                        try {
                            const { generateTickets } = await import("@/services/ticketService");
                            const userId = ticketOrder.user?.toString() || metadata?.userId || "";
                            await generateTickets({
                                eventId: ticketOrder.event.toString(),
                                userId,
                                batches: ticketOrder.tickets,
                                paymentReference: data.reference,
                                isPaid: true,
                                generatedBy: 'online-sale'
                            });
                        } catch (genErr: any) {
                            console.error("Auto ticket generation failed in webhook:", genErr.message);
                        }
                    }
                }
            }
        }
    }

    return NextResponse.json({ received: true })
}