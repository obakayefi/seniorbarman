"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarX2 } from "lucide-react";
import LandingEventCard from "./LandingEventCard";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

interface Event {
    _id: string;
    title: string;
    date: string;
    venue: string;
    image?: string;
    ticketTypes?: { name: string; price: number }[];
    description?: string;
    requiresApplication?: boolean;
    ctaText?: string;
}

interface DiscoverEventsSectionProps {
    events: Event[];
    isLoading?: boolean;
}

export default function DiscoverEventsSection({ events, isLoading = false }: DiscoverEventsSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const scroll = (direction: "left" | "right") => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: direction === "right" ? 320 : -320, behavior: "smooth" });
    };

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    return (
        <section className="w-full max-w-6xl mx-auto px-4 py-4">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h2 className="text-2xl font-extrabold text-foreground">Discover Events</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Trending events near you</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/events"
                        className="hidden sm:block text-xs font-bold uppercase tracking-wider text-orange-500 hover:text-orange-400 transition-colors mr-2"
                    >
                        View All →
                    </Link>

                    {/* Scroll Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll("left")}
                            disabled={!canScrollLeft || isLoading}
                            className="w-8 h-8 rounded-sm border border-border bg-card text-muted-foreground flex items-center justify-center hover:border-orange-500 hover:text-orange-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            disabled={!canScrollRight || isLoading}
                            className="w-8 h-8 rounded-sm border border-border bg-card text-muted-foreground flex items-center justify-center hover:border-orange-500 hover:text-orange-500 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State or Cards Row */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground gap-3 border border-dashed border-border bg-card rounded-sm shadow-sm">
                    <Spinner className="text-orange-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Fetching events...</span>
                </div>
            ) : !events || events.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 rounded-sm border border-dashed border-border bg-card shadow-sm text-center">
                    <div className="p-4 rounded-full bg-muted border border-border mb-3">
                        <CalendarX2 size={32} className="text-muted-foreground" />
                    </div>
                    <h4 className="text-base font-black text-foreground uppercase tracking-tight mb-1">No Events Found</h4>
                    <p className="text-xs text-muted-foreground">No events found for this filter. Try selecting another filter!</p>
                </div>
            ) : (
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1"
                    style={{ scrollSnapType: "x mandatory" }}
                >
                    {events.map((event) => (
                        <div
                            key={event._id}
                            className="flex-shrink-0 w-[280px] sm:w-[300px]"
                            style={{ scrollSnapAlign: "start" }}
                        >
                            <LandingEventCard event={event} />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
