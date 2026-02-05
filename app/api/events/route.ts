import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event"
import { verifyAuth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import upcomingEvents from "@/components/ui/upcoming-events";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    // const upcoming = searchParams.get("upcoming");
    const eventType = searchParams.get("type");

    try {
        await connectDB()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcomingActivities = await Event.find({
            type: eventType,
            date: { $gte: today }
        })
            .sort({ date: 1 })
            .lean()

        // Filter logic:
        // 1. If date > today (future), keep it.
        // 2. If date == today, keep only if time < 3:30 PM WAT (15:30).

        let eventsToReturn: any[] = []

        if (eventType === 'event') {
            eventsToReturn = upcomingActivities
        } else if (eventType === 'sports') {
            const upcomingEvents = upcomingActivities.filter((event: any) => {
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
            eventsToReturn = upcomingEvents
        }

        return NextResponse.json(
            { events: eventsToReturn },
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
        await connectDB();

        const formData = await req.formData();
        const title = formData.get("eventTitle") as string;
        const type = formData.get("eventType") as string;
        const time = formData.get("eventTime") as string;
        const date = formData.get("eventDate") as string;
        const venue = formData.get("eventVenue") as string;
        const homeTeam = formData.get("homeTeam") as string;
        const awayTeam = formData.get("awayTeam") as string;
        const imageFile = formData.get("imageFile") as File;
        const regularPrice = formData.get("regularPrice") as string;
        const vipPrice = formData.get("vipPrice") as string;

        if (type === "event" && !title) {
            return NextResponse.json(
                { error: "Events require titles" },
                { status: 400 }
            );
        }

        if (type === "sports" && (!homeTeam || !awayTeam)) {
            return NextResponse.json(
                { error: "Sports events require home and away teams" },
                { status: 400 }
            );
        }

        let imageUrl = "";
        if (imageFile) {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResult: any = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: "seniorbarman" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });
            imageUrl = uploadResult.secure_url;
        }

        let newEvent = type === "sports" ? {
            homeTeam,
            awayTeam,
            time,
            venue,
            type,
            date,
            regularPrice: Number(regularPrice) || 0,
            vipPrice: Number(vipPrice) || 0,
            image: imageUrl
        } : {
            title,
            date,
            type,
            time,
            venue,
            regularPrice: Number(regularPrice) || 0,
            vipPrice: Number(vipPrice) || 0,
            image: imageUrl
        };

        const event = await Event.create(newEvent);
        return NextResponse.json(
            {
                success: true,
                message: "Event created successfully.",
                event: event
            },
            {
                status: 201
            }
        );
    } catch (error: any) {
        console.error("Error creating event", error);
        return NextResponse.json(
            { error: "Failed to create event.", details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (!type) {
        return NextResponse.json(
            { error: "Event type is required" },
            { status: 400 }
        );
    }

    try {
        await connectDB();
        const result = await Event.deleteMany({ type });

        return NextResponse.json(
            {
                success: true,
                message: `Deleted ${result.deletedCount} events of type '${type}'`,
                deletedCount: result.deletedCount
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to delete events", details: error.message },
            { status: 500 }
        );
    }
}