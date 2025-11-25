import {NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import Event from "@/models/Event"
import {verifyAuth} from "@/lib/auth";

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url);
    const upcoming = searchParams.get("upcoming");
    let filter = {}
    let sort = {date: -1};
    const now = new Date();
    const cutoff = new Date(now.getTime() - 120 * 60 * 1000);

    try {
        await connectDB()
        // await verifyAuth()
        let _events = await Event.find().sort({date: -1});
        if (upcoming) {
            _events = _events.filter((event) => {
                const [hours, minutes] = event.time.split(":");
                const eventStart = new Date(event.date);
                eventStart.setHours(Number(hours));
                eventStart.setMinutes(Number(minutes));
                eventStart.setSeconds(0);

                // console.log({eventStart, cutoff})
                return eventStart >= cutoff;
            })
        }

        const events = await Event.find().sort({date: -1})
        const filteredEvents = await Event.find(filter).sort({date: -1})
        // console.log({filteredEvents, events, _events})
        return NextResponse.json(_events)
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
                {error: "Events require titles"},
                {status: 400}
            )
        }

        if (type === "sports" && (!homeTeam || !awayTeam)) {
            return NextResponse.json(
                {error: "Sports events require home and away teams"},
                {status: 400}
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
            {error: "Failed to create event.", details: error.message},
            {status: 500}
        )
    }
}