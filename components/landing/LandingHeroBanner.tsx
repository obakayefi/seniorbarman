"use client";

import React from "react";
import Link from "next/link";
import { CalendarPlus, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { EventCreatorRoleChecker } from "@/lib/helpers";

interface LandingHeroBannerProps {
    ctaText?: string;
    ctaLabel?: string;
    ctaHref?: string;
}

export default function LandingHeroBanner({
    ctaText = "Create and share your event with the world effortlessly today",
    ctaLabel = "Create Event",
    ctaHref = "/u/organizer/events/create",
}: LandingHeroBannerProps) {
    const { user } = useApp();

    const isAuthenticated = Boolean(user?.id);
    const canCreateEvents = isAuthenticated && EventCreatorRoleChecker(user?.role);

    // If user is signed in but their role does not permit creating events, don't show the banner CTA
    if (isAuthenticated && !canCreateEvents) {
        return null;
    }

    // If signed out, redirect to register with organizer role preselected
    const targetHref = isAuthenticated ? ctaHref : "/auth/register?role=organizer";

    return (
        <div className="w-full bg-orange-500/10 dark:bg-zinc-900/60 backdrop-blur-lg border-b border-orange-500/20 dark:border-zinc-800 py-3 px-4 transition-colors">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
                <p className="text-sm text-foreground/90 dark:text-zinc-300 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                    <span>{ctaText}</span>
                </p>
                <Link
                    href={targetHref}
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-sm transition-all shadow-md shadow-orange-500/20 whitespace-nowrap"
                >
                    <CalendarPlus className="w-4 h-4" />
                    <span>{ctaLabel}</span>
                </Link>
            </div>
        </div>
    );
}
