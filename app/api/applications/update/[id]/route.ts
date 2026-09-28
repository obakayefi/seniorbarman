import { connectDB } from "@/lib/mongodb";
import { populateTeamsForApplications } from "@/lib/populateEventTeams";
import Event from "@/models/Event";
import EventApplication from "@/models/EventApplication";
import Team from "@/models/Team";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";


export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { paymentStatus } = body;

        if (!paymentStatus) {
            return NextResponse.json({ error: "Payment status is required" }, { status: 400 });
        }

        await connectDB();
        User.init();
        Team.init();
        Event.init();

        //     const rawApplication = await EventApplication.findById(id)
        //         .populate('event')
        //         .populate('user')
        //         .lean();
        //     if (!rawApplication) {
        //         return NextResponse.json({ error: "Application not found" }, { status: 404 });
        //     }

        //     const application = await populateTeamsForApplications(rawApplication);

        return NextResponse.json({ paymentStatus }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching application:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}   
