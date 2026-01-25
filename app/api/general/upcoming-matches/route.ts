import { NextResponse } from 'next/server'
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event"

export async function GET(req: Request) {
    try {
        await connectDB()
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const rawMatches = await Event.find({
            date: { $gte: today }
        })
            .sort({ date: 1 })
            .lean()

        const upcomingMatches = rawMatches.filter((event: any) => {
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

        const nextMatch = upcomingMatches[0] || null

        return NextResponse.json(
            { nextMatch, upcomingMatches },
            { status: 200 }
        )
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