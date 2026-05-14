import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event"
import EventApplication from "@/models/EventApplication";
import User from "@/models/User";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    try {
        await connectDB();
        User.init();

        const application = await EventApplication.findById(id).populate('event user');
        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        return NextResponse.json({ application }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching application:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
