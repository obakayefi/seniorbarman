import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event"
import { verifyAuth } from "@/lib/auth";

export async function GET() {
    try {
        await connectDB()
        await verifyAuth()
        const events = await Event.find().sort({ date: 1 })
        console.log({ events })
        return NextResponse.json(events)
    } catch (error: any) {
        return NextResponse.json({
            error: "Can't fetch events:: " + error.message
        },
            {
                status: 401
            }
        )
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    await connectDB()
    const body = await req.json()

    const updated = await Event.findByIdAndUpdate(params.id, body, { new: true })
    return NextResponse.json(updated)
}

export async function POST(req: Request) {
    try {
        await connectDB()
        const body = await req.json()
        const {
            eventTitle: title,
            eventTime: time,
            eventDate: date,
            eventVenue: venue,
            homeTeam,
            awayTeam,
            eventType: type
        } = body;
        // console.log({body})
        if (type === "event" && !title) {
            return NextResponse.json(
                { error: "Events require titles" },
                { status: 400 }
            )
        }

        if (type === "sports" && (!homeTeam || !awayTeam)) {
            return NextResponse.json(
                { error: "Sports events require home and away teams" },
                { status: 400 }
            )
        }

        let newEvent = type === "sports" ? {
            homeTeam,
            awayTeam,
            time,
            venue,
            type,
            date
        } : {
            title,
            date,
            type,
            time,
            venue
        }

        console.log({ newEvent })

        const event = await Event.create(newEvent)

        return NextResponse.json(
            {
                success: true,
                message: "Event created successfully.",
                event: event
            },
            {
                status: 201
            }
        )
    } catch (error: any) {
        console.error("Error creating event", error)
        return NextResponse.json(
            { error: "Failed to create event.", details: error.message },
            { status: 500 }
        )
    }
}