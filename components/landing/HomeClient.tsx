"use client";

import React, { useState } from "react";
import AnnouncementBanner from "@/components/landing/AnnouncementBanner";
import LandingHeroBanner from "@/components/landing/LandingHeroBanner";
import CategoryQuickAccessCards from "@/components/landing/CategoryQuickAccessCards";
import SearchAndFilters from "@/components/landing/SearchAndFilters";
import DiscoverEventsSection from "@/components/landing/DiscoverEventsSection";
import FloatingSupport from "@/components/landing/FloatingSupport";

interface HomeClientProps {
    initialEvents: any[];
    ctaText: string;
    ctaLabel: string;
}

export default function HomeClient({ initialEvents, ctaText, ctaLabel }: HomeClientProps) {
    const [activeFilter, setActiveFilter] = useState("");
    const [events, setEvents] = useState(initialEvents);
    const [loading, setLoading] = useState(false);

    const handleFilterChange = async (filter: string) => {
        setActiveFilter(filter);
        setLoading(true);
        try {
            const url = filter
                ? `/api/events?type=event&dateFilter=${encodeURIComponent(filter)}&limit=12`
                : `/api/events?type=event&limit=12`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.events) {
                const formatted = data.events.map((e: any) => ({
                    _id: String(e._id),
                    title: e.title || "",
                    date: e.date ? new Date(e.date).toISOString() : String(e.date),
                    venue: e.venue || "",
                    image: e.image || null,
                    description: e.description || "",
                    requiresApplication: Boolean(e.requiresApplication),
                    ctaText: e.ctaText || "Book Ticket",
                    ticketTypes: (e.ticketTypes || []).map((t: any) => ({
                        name: t.name,
                        price: t.price,
                    })),
                }));
                setEvents(formatted);
            }
        } catch (err) {
            console.error("Failed to filter events", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors">
            {/* Top announcement ticker */}
            <AnnouncementBanner />

            {/* Orange CTA sub-banner */}
            <LandingHeroBanner
                ctaText={ctaText}
                ctaLabel={ctaLabel}
                ctaHref="/u/organizer/events/create"
            />

            {/* Main content area */}
            <main className="w-full flex flex-col items-center gap-8 py-8">

                {/* Category Quick Access Cards */}
                <CategoryQuickAccessCards />

                {/* Search + Date Filters */}
                <SearchAndFilters activeFilter={activeFilter} onFilterChange={handleFilterChange} />

                {/* Discover Events section */}
                <DiscoverEventsSection events={events} isLoading={loading} />
            </main>

            {/* Floating support widget */}
            <FloatingSupport />
        </div>
    );
}
