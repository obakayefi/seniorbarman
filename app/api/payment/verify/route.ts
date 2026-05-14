import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import axios from "axios";
import EventApplication from "@/models/EventApplication";
import User from "@/models/User";
import Event from "@/models/Event";
import TicketOrder from "@/models/TicketOrder";
import { notifyOrganizerOfPayment } from "@/lib/notifications";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const reference = searchParams.get("reference");

        if (!reference) {
            return NextResponse.json({ error: "Reference missing" }, { status: 400 });
        }

        if (reference.startsWith('FREE-')) {
            return NextResponse.json(
                { status: 'success', type: 'ticket', message: 'Free order verified' },
                { status: 200 }
            );
        }

        const paystackRes = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: { Authorization: `Bearer ${process.env.PAYSTACK_API_KEY}` }
            }
        );

        const transaction = paystackRes.data.data;
        const metadata = transaction?.metadata || {};
        const paymentType = metadata?.type || "ticket";

        if (paymentType === "event_application" && transaction?.status === "success") {
            await connectDB();
            const application = await EventApplication.findOneAndUpdate(
                {
                    event: metadata.eventId,
                    user: metadata.userId,
                    paymentRef: reference,
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
                const organizer = await User.findById(event.createdBy);

                if (organizer) {
                    await notifyOrganizerOfPayment({
                        organizerEmail: organizer.email,
                        organizerName: organizer.firstName || organizer.username,
                        organizerId: organizer._id.toString(),
                        eventTitle: event.title || 'Event',
                        applicantName: `${applicant.firstName} ${applicant.lastName}`,
                        amount: transaction.amount / 100
                    });
                }
            }
        }

        if (paymentType === "ticket" && transaction?.status === "success") {
            await connectDB();
            await TicketOrder.findOneAndUpdate(
                { reference },
                { paymentStatus: "success" }
            );
        }

        return NextResponse.json(
            {
                status: transaction.status,
                type: paymentType,
                message: paystackRes.data.message,
                metadata,
                eventId: metadata?.eventId,
                eventTitle: metadata?.eventTitle,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Verify error:", error.message);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}