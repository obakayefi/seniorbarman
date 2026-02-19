import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import cloudinary from "@/lib/cloudinary";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();
        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }
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
        const regularPrice = formData.get("regularPrice") as string;
        const vipPrice = formData.get("vipPrice") as string;

        const existingEvent = await Event.findById(id);
        if (!existingEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
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
            // time,
            venue,
            date: finalDate || date, // Fallback to provided date if no time merge logic ran, or undefined if not provided
            regularPrice: Number(regularPrice) || 0,
            vipPrice: Number(vipPrice) || 0,
            image: imageUrl
        };

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
