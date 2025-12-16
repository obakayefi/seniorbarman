import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking"
import Event from "@/models/Event"
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
    try {
        await connectDB();
        const { name, email, message, eventID } = await req.json()

        const event = await Event.findById(eventID)
        //console.log({ name, email, message })
        if (!event) return NextResponse.json(
            {
                error: "Event not found",
            },
            {
                status: 404
            })

        // const booking = await Booking.create({ name, email, message, eventID })

        // await resend.emails.send({
        //     from: "Get into Event fr kodagiwa@gmail.com",
        //     to: process.env.ADMIN_EMAIL ?? '',
        //     subject: `New Booking ${event.title}`,
        //     html: `
        //         <h3>New Booking Received</h3>
        //         <p><b>Name:</b> ${name}</p>
        //         <p><b>Email:</b> ${email}</p>
        //         <p><b>Event:</b> ${event.title}</p>
        //         <p><b>Message:</b> ${message || "No message"}</p>
        //         `
        // })

        // return NextResponse.json({ success: true, booking })
        return NextResponse.json({ success: true, event })

    } catch (error: any) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}