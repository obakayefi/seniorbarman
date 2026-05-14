import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { requireRole } from "@/lib/requireRole";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        
        const authResult = await requireRole(["organizer"]);
        if (authResult instanceof NextResponse) return authResult;

        // Fetch events created by this organizer
        const events = await Event.find({ createdBy: authResult.id })
            .sort({ date: -1 })
            .lean();

        return NextResponse.json({ success: true, events }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch organizer events: " + error.message },
            { status: 500 }
        );
    }
}
