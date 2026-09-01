"use client"
import EventHero from "@/components/ui/event-hero";
import { GiSmallFire } from "react-icons/gi";
import LandingEventCard from "@/components/landing/LandingEventCard";
import { CalendarX2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import api from "@/lib/axios";

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [coverImage, setCoverImage] = useState(
        "linear-gradient(to left, rgba(0,0,0,0.001), rgba(0,0,0,0.001)), url('/premium_event_crowd.png')"
    );

    useEffect(() => {
        fetch("/api/events?type=event")
            .then((res) => res.json())
            .then((data) => setEvents(data.events || []))
            .catch(() => setEvents([]))
            .finally(() => setLoadingEvents(false));

        api.get("/settings")
            .then((res) => {
                if (res.data.settings?.events_page_cover_image) {
                    setCoverImage(
                        `linear-gradient(to left, rgba(0,0,0,0.001), rgba(0,0,0,0.001)), url('${res.data.settings.events_page_cover_image}')`
                    );
                }
            })
            .catch(() => {});
    }, []);

    return (
        <section className="flex flex-col gap-2 bg-background min-h-screen text-foreground transition-colors">
            <div className="relative h-[45vh] lg:h-[50vh] overflow-x-hidden text-white">
                {/* background image */}
                <div
                    className="absolute inset-0 bg-cover h-full bg-bottom bg-no-repeat z-0"
                    style={{
                        backgroundImage: coverImage,
                    }}
                />

                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10" />

                {/* content */}
                <div className="relative z-20 flex py-16 max-w-7xl mx-auto w-full px-6 h-full items-center">
                    <EventHero />
                </div>
            </div>

            <section className="lg:pb-16 pb-8 flex flex-col w-full mt-6">
                <div className="max-w-7xl mx-auto w-full px-6">
                    <h3 className="text-2xl font-extrabold flex items-center uppercase gap-2 py-6 text-foreground border-b border-border mb-8">
                        <span className="text-orange-500">
                            <GiSmallFire />
                        </span>{" "}
                        All Events
                    </h3>

                    {loadingEvents ? (
                        <div className="flex text-zinc-500 items-center justify-center py-20 gap-3">
                            <Spinner className="text-orange-500" />
                            <span className="text-sm font-medium">Loading events...</span>
                        </div>
                    ) : events.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {events.map((event: any) => (
                                <LandingEventCard
                                    key={event._id}
                                    event={{
                                        _id: String(event._id),
                                        title: event.title || "",
                                        date: event.date?.toISOString?.() ?? String(event.date),
                                        venue: event.venue || "",
                                        image: event.image,
                                        type: event.type,
                                        homeTeam: event.homeTeam,
                                        awayTeam: event.awayTeam,
                                        requiresApplication: event.requiresApplication,
                                        ticketTypes: event.ticketTypes,
                                        description: event.description,
                                        ctaText: event.ctaText,
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 sm:p-16 rounded-sm bg-card text-card-foreground border border-dashed border-border my-4 text-center shadow-sm">
                            <div className="p-4 rounded-full bg-muted border border-border mb-4">
                                <CalendarX2 size={36} className="text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-black text-foreground tracking-tight mb-2 uppercase">
                                No Active Events
                            </h3>
                            <p className="text-muted-foreground font-medium max-w-sm leading-relaxed text-xs">
                                There are currently no scheduled events. We are actively curating new events, so check back shortly!
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </section>
    );
}
