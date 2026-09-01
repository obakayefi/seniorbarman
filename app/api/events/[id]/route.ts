import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromCookie } from "@/lib/auth";
import Event from "@/models/Event";
import Team from "@/models/Team";
import cloudinary from "@/lib/cloudinary";
import { populateTeamsForEvents } from "@/lib/populateEventTeams";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();
        const rawEvent = await Event.findById(id).lean();
        if (!rawEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }
        const event = await populateTeamsForEvents(rawEvent);
        return NextResponse.json(event, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
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
        const ctaText = formData.get("ctaText") as string;
        const ticketTypesStr = formData.get("ticketTypes") as string;
        const requiresApplication = formData.get("requiresApplication");
        const applicationFee = formData.get("applicationFee");
        const formFieldsStr = formData.get("formFields") as string;

        let ticketTypes = [];
        try {
            if (ticketTypesStr) ticketTypes = JSON.parse(ticketTypesStr);
        } catch (e) {
            console.error("Failed to parse ticketTypes:", e);
        }

        let formFields: any[] = [];
        try {
            if (formFieldsStr) formFields = JSON.parse(formFieldsStr);
        } catch (e) {
            console.error("Failed to parse formFields:", e);
        }

        const existingEvent = await Event.findById(id);
        if (!existingEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const user = await getUserFromCookie();
        if (!user || (user.role !== 'admin' && user.role !== 'dev' && existingEvent.createdBy?.toString() !== user.id)) {
            return NextResponse.json({ error: "Forbidden: You do not have permission to edit this event" }, { status: 403 });
        }

        let imageUrl = existingEvent.image;
        if (imageFile && typeof imageFile !== 'string') {
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

        let finalDate = undefined;
        if (date) {
            finalDate = new Date(date);
            if (time) {
                const [hours, minutes] = time.split(':').map(Number);
                if (!isNaN(hours) && !isNaN(minutes)) {
                    finalDate.setHours(hours, minutes);
                }
            }
        } else if (existingEvent.date && time) {
            // If date isn't changing but time is, we need to update the existing date's time
            finalDate = new Date(existingEvent.date);
            const [hours, minutes] = time.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
                finalDate.setHours(hours, minutes);
            }
        }


        const updatedData: any = {
            venue,
            date: finalDate || date,
            ticketTypes: ticketTypes.length > 0 ? ticketTypes : existingEvent.ticketTypes,
            image: imageUrl
        };

        if (ctaText !== null && ctaText !== undefined) {
            updatedData.ctaText = ctaText.trim() || "Book Ticket";
        }

        // Only update application fields if they were explicitly provided
        if (requiresApplication !== null && requiresApplication !== undefined) {
            updatedData.requiresApplication = requiresApplication === "true";
            updatedData.applicationFee = updatedData.requiresApplication ? Number(applicationFee || 0) : 0;
            updatedData.formFields = updatedData.requiresApplication ? formFields : [];
        }

        if (type === "sports") {
            updatedData.homeTeam = homeTeam;
            updatedData.awayTeam = awayTeam;
        } else {
            updatedData.title = title;
        }

        const updatedEvent = await Event.findByIdAndUpdate(id, updatedData, { new: true });

        return NextResponse.json({
            success: true,
            message: "Event updated successfully",
            event: updatedEvent
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error updating event", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();
        
        const existingEvent = await Event.findById(id);
        if (!existingEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const user = await getUserFromCookie();
        if (!user || (user.role !== 'admin' && user.role !== 'dev' && existingEvent.createdBy?.toString() !== user.id)) {
            return NextResponse.json({ error: "Forbidden: You do not have permission to delete this event" }, { status: 403 });
        }

        const event = await Event.findByIdAndDelete(id);
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }
        return NextResponse.json({
            success: true,
            message: "Event deleted successfully"
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
