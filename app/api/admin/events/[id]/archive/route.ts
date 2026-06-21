import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromCookie } from "@/lib/auth";
import Event from "@/models/Event";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();
        
        const existingEvent = await Event.findById(id);
        if (!existingEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const user = await getUserFromCookie();
        // Admins and Devs can archive
        if (!user || (user.role !== 'admin' && user.role !== 'dev')) {
            return NextResponse.json({ error: "Forbidden: You do not have permission to archive this event" }, { status: 403 });
        }

        const isArchived = !existingEvent.isArchived;

        const updatedEvent = await Event.findByIdAndUpdate(
            id, 
            { isArchived }, 
            { new: true }
        );

        return NextResponse.json({
            success: true,
            message: `Event ${isArchived ? 'archived' : 'unarchived'} successfully`,
            event: updatedEvent
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error archiving event", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
