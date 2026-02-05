import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event"
import { verifyAuth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const upcoming = searchParams.get("upcoming");

    try {
        await connectDB()

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcomingMatchesRaw = await Event.find({
            date: { $gte: today }
        })
            .sort({ date: 1 })
            .lean()

        // Filter logic:
        // 1. If date > today (future), keep it.
        // 2. If date == today, keep only if time < 3:30 PM WAT (15:30).

        const upcomingMatches = upcomingMatchesRaw.filter((event: any) => {
            const eventDate = new Date(event.date)
            // Normalize event date to midnight for comparison
            const eventMidnight = new Date(eventDate)
            eventMidnight.setHours(0, 0, 0, 0)

            // Check if future date
            if (eventMidnight.getTime() > today.getTime()) {
                return true
            }

            // It's today. Check WAT cutoff.
            // Get current time in WAT
            const watTime = new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" });
            const nowInWat = new Date(watTime);

            const currentHour = nowInWat.getHours();
            const currentMinute = nowInWat.getMinutes();

            // Cutoff is 15:30
            if (currentHour < 15) return true;
            if (currentHour === 15 && currentMinute < 30) return true;

            return false;
        })

        console.log({ upcomingMatchesCount: upcomingMatches.length })
        return NextResponse.json(
            { events: upcomingMatches, totalEvents: upcomingMatches.length },
            { status: 200 }
        )
    } catch
    (error: any) {
        return NextResponse.json({
            error: "Can't fetch events:: " + error.message
        },
            {
                status: 401
            }
        )
    }
}

// export async function PATCH(req: Request, { params }: { params: { id: string } }) {
//     await connectDB()
//     const body = await req.json()

//     const updated = await Event.findByIdAndUpdate(params.id, body, { new: true })
//     return NextResponse.json(updated)
// }

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