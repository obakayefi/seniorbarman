import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event"
import { verifyAuth, getUserFromCookie } from "@/lib/auth";
import { requireRole } from "@/lib/requireRole";
import { canCreateEvent } from "@/lib/policies";
import cloudinary from "@/lib/cloudinary";
import upcomingEvents from "@/components/ui/upcoming-events";
import { paginateArray } from "@/lib/pagination";

import Team from "@/models/Team";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get("type");
    const forScanner = searchParams.get("forScanner") === "true";
    const page = searchParams.get("page");
    const limit = searchParams.get("limit") || "5";

    try {
        await connectDB()
        const user = await getUserFromCookie();
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        // 2 hours ago date
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

        const query: any = {
            type: eventType,
            date: { $gte: forScanner ? twoHoursAgo : today },
            isArchived: { $ne: true }
        };

        // If for scanner, restrict based on role
        if (forScanner && user) {
            if (user.role === 'organizer') {
                query.createdBy = user.id;
            } else if (user.role === 'team_manager') {
                query.type = 'sports';
                const managedTeams = await Team.find({ managers: user.id }).select("_id");
                query.homeTeam = { $in: managedTeams.map((t: any) => t._id) };
            }
        }

        const upcomingActivities = await Event.find(query)
            .sort({ date: -1 })
            .populate("homeTeam", "name logo")
            .populate("awayTeam", "name logo")
            .lean()

        const watTime = new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" });
        const nowInWat = new Date(watTime);

        console.log({ upcomingActivities })

        const filteredEvents = upcomingActivities.filter((event: any) => {
            const eventDate = new Date(event.date)
            // Normalize event date for midnight comparison
            const eventMidnight = new Date(eventDate)
            eventMidnight.setHours(0, 0, 0, 0)

            // 1. Check if future date (strictly after today)
            // if (eventMidnight.getTime() > today.getTime()) {
            //     return true
            // }

            // 2. It's today.
            // If it's for the scanner, we show it as long as it's within the 2-hour post-start window
            if (forScanner) {
                return eventDate >= twoHoursAgo;
            };

            // Otherwise, check against start time with 30-minute buffer for sales.
            try {
                // For regular events, we allow sales all day as long as it's today or future
                if (event.type === 'event') {
                    const eventEndOfDay = new Date(eventDate);
                    eventEndOfDay.setHours(23, 59, 59, 999);
                    return nowInWat < eventEndOfDay;
                }

                // For sports, keep the 30-minute pre-event cutoff
                const cutoffTime = new Date(eventDate.getTime() - 30 * 60 * 1000);
                return nowInWat < cutoffTime;
            } catch (e) {
                // Fallback for malformed time strings - better to show than hide if date is today
                return true;
            }
        });

        const paginated = paginateArray(filteredEvents, { page, limit });

        return NextResponse.json(
            { 
                events: paginated.data,
                pagination: paginated.pagination 
            },
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

// export async function PATCH(req: Request, { params }: { params: { id: string } }) {
//     await connectDB()
//     const body = await req.json()

//     const updated = await Event.findByIdAndUpdate(params.id, body, { new: true })
//     return NextResponse.json(updated)
// }

export async function POST(req: Request) {
    try {
        await connectDB();

        // Verify user has permission to create events
        const authResult = await requireRole(["admin", "dev", "organizer", "team_manager"]);
        if (authResult instanceof NextResponse) return authResult;

        const formData = await req.formData();
        const title = formData.get("eventTitle") as string;
        const type = formData.get("eventType") as string;
        const time = formData.get("eventTime") as string;
        const date = formData.get("eventDate") as string;
        const venue = formData.get("eventVenue") as string;
        const homeTeam = formData.get("homeTeam") as string;
        const awayTeam = formData.get("awayTeam") as string;

        const isAllowed = await canCreateEvent(authResult as any, { type, homeTeam, awayTeam });
        if (!isAllowed) {
            return NextResponse.json(
                { error: "Forbidden: You do not have permission to create this event." },
                { status: 403 }
            );
        }
        const imageFile = formData.get("imageFile") as File;
        const ticketTypesStr = formData.get("ticketTypes") as string;
        const requiresApplication = formData.get("requiresApplication") === "true";
        const applicationFee = Number(formData.get("applicationFee") || 0);
        const formFieldsStr = formData.get("formFields") as string;

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

        let ticketTypes = [];
        try {
            if (ticketTypesStr) ticketTypes = JSON.parse(ticketTypesStr);
        } catch (e) {
            console.error("Failed to parse ticketTypes:", e);
        }

        let formFields = [];
        try {
            if (formFieldsStr) formFields = JSON.parse(formFieldsStr);
        } catch (e) {
            console.error("Failed to parse formFields:", e);
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

        let finalDate = new Date(date);

        // Use a 4.5 minute buffer so that selecting exactly 5 minutes on the dot 
        // doesn't fail due to seconds currently elapsed.
        const fourHalfMinsFromNow = new Date(Date.now() + 4.5 * 60000);
        if (finalDate <= fourHalfMinsFromNow) {
            return NextResponse.json(
                { error: "Event date must be at least 5 minutes from now" },
                { status: 400 }
            );
        }

        let newEvent = type === "sports" ? {
            homeTeam,
            awayTeam,
            venue,
            type,
            date: finalDate,
            description: "Join us for an exciting match!",
            ticketTypes: ticketTypes,
            image: imageUrl,
            createdBy: authResult.id
        } : {
            title,
            date: finalDate,
            type,
            venue,
            description: "Join us for an exciting event!",
            ticketTypes: ticketTypes,
            image: imageUrl,
            requiresApplication,
            applicationFee: requiresApplication ? applicationFee : 0,
            formFields: requiresApplication ? formFields : [],
            createdBy: authResult.id,
            isAudition: formData.get("isAudition") === "true",
            requestPicture: formData.get("requestPicture") === "true",
            allowNoTickets: formData.get("allowNoTickets") === "true",
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