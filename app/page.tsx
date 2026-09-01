import { connectDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import EventModel from "@/models/Event";
import HomeClient from "@/components/landing/HomeClient";

export default async function Home() {
    await connectDB();
    const settingsList = await Setting.find({});
    const settings: Record<string, any> = {};
    settingsList.forEach((s) => (settings[s.key] = s.value));

    // Fetch upcoming non-archived events, sorted by date ascending
    let events: any[] = [];
    try {
        const rawEvents = await EventModel.find({
            type: "event",
            isArchived: { $ne: true },
            date: { $gte: new Date() },
        })
            .sort({ createdAt: -1 })
            .limit(12)
            .lean();

        // Serialize for client components
        events = rawEvents.map((e: any) => ({
            _id: String(e._id),
            title: e.title || "",
            date: e.date?.toISOString?.() ?? String(e.date),
            venue: e.venue || "",
            image: e.image || null,
            description: e.description || "",
            requiresApplication: Boolean(e.requiresApplication),
            ctaText: e.ctaText?.trim() || "Book Ticket",
            ticketTypes: (e.ticketTypes || []).map((t: any) => ({
                name: t.name,
                price: t.price,
            })),
        }));
    } catch (err) {
        console.error("Failed to fetch events for landing page", err);
    }

    const ctaText =
        settings.root_hero_cta_text ||
        "Create and share your event with the world effortlessly today";
    const ctaLabel = settings.root_hero_cta_label || "Create Event";

    return <HomeClient initialEvents={events} ctaText={ctaText} ctaLabel={ctaLabel} />;
}
