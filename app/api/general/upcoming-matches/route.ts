import {NextResponse} from 'next/server'
import {connectDB} from "@/lib/mongodb";
import Event from "@/models/Event"

export async function GET(req: Request) {
    try {
        await connectDB()
        const today = new Date();
        const nextMatch = await Event.findOne({
            date: {$gt: today}
        })
            .sort({date: 1})
            .lean()
        
        const upcomingMatches = await Event.find({
            date: {$gt: today}
        })
            .sort({date: 1})
            .lean()
       
        return NextResponse.json(
            {nextMatch, upcomingMatches},
            {status: 200}
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