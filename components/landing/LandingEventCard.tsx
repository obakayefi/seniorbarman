"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ClipboardList, MapPin, Shield } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { BookRegularEventModal } from "@/components/modals/book-regular-event";

interface TicketType {
    name: string;
    price: number;
}

interface TeamRef {
    _id?: string;
    name?: string;
    logo?: string;
}

interface LandingEventCardProps {
    event: {
        _id: string;
        title: string;
        date: string;
        venue: string;
        image?: string;
        type?: "event" | "sports";
        homeTeam?: TeamRef | string;
        awayTeam?: TeamRef | string;
        ticketTypes?: TicketType[];
        description?: string;
        requiresApplication?: boolean;
        ctaText?: string;
    };
}

function useCountdown(targetDate: string) {
    const calculateTimeLeft = () => {
        const diff = new Date(targetDate).getTime() - Date.now();
        if (diff <= 0) return { days: 0, hrs: 0, mins: 0, secs: 0, expired: true };
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hrs: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            secs: Math.floor((diff % (1000 * 60)) / 1000),
            expired: false,
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    return timeLeft;
}

function CountdownBox({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center min-w-[40px]">
            <span className="text-base font-bold text-foreground leading-none tabular-nums">
                {String(value).padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium mt-0.5">{label}</span>
        </div>
    );
}

export default function LandingEventCard({ event }: LandingEventCardProps) {
    const countdown = useCountdown(event.date);
    // console.log({ event })
    const router = useRouter();
    const { user } = useApp();
    const [buyOpen, setBuyOpen] = useState(false);

    const hasTickets = event.ticketTypes && event.ticketTypes.length > 0;

    const minPrice = event.ticketTypes && event.ticketTypes.length > 0
        ? Math.min(...event.ticketTypes.map((t) => t.price))
        : null;

    const priceLabel =
        minPrice === null ? "FREE" : minPrice === 0 ? "FREE" : `₦${minPrice.toLocaleString("en-NG")}`;

    const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

    const href = `/events/${event._id}`;

    // Determine primary CTA logic:
    // If the event has tickets → always offer booking regardless of requiresApplication
    // If no tickets but requiresApplication → show Apply Now
    const canSellTickets = hasTickets;
    const primaryCtaText = event.ctaText || (canSellTickets ? "Book Ticket" : "Apply Now");
    const primaryCtaHref = `/u/events/${event._id}/apply`;

    const handleApplyDirect = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            localStorage.setItem(
                "pendingApplication",
                JSON.stringify({
                    eventId: event._id,
                    eventTitle: event.title,
                })
            );
            router.push(`/auth/register?redirect=/u/events/${event._id}/apply`);
            return;
        }
        router.push(`/u/events/${event._id}/apply`);
    };

    // Check if this is a sports event (or has team info)
    const isSports = event.type === "sports" || Boolean(event.homeTeam || event.awayTeam);
    const homeTeamObj = typeof event.homeTeam === "object" ? event.homeTeam : null;
    const awayTeamObj = typeof event.awayTeam === "object" ? event.awayTeam : null;
    const homeName = homeTeamObj?.name || (typeof event.homeTeam === "string" ? event.homeTeam : "Home");
    const awayName = awayTeamObj?.name || (typeof event.awayTeam === "string" ? event.awayTeam : "Away");
    const homeLogo = homeTeamObj?.logo || null;
    const awayLogo = awayTeamObj?.logo || null;

    return (
        <div className="group bg-card border border-border rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col hover:-translate-y-0.5">
            {/* Header Banner Section */}
            <div className="relative h-44 w-full overflow-hidden flex-shrink-0 bg-muted/40">
                {isSports ? (
                    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                        {/* Background match ambiance image / fallback */}
                        {event.image ? (
                            <Image
                                src={event.image}
                                alt={event.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-40 blur-[1px]"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-tr from-muted via-orange-500/10 to-background" />
                        )}

                        {/* Modern Glassmorphic Match Card Banner */}
                        <div className="relative z-10 w-[90%] h-[80%] rounded-sm bg-card/80 dark:bg-white/10 backdrop-blur-md border border-border dark:border-white/20 shadow-sm flex items-center justify-evenly p-3 group-hover:border-orange-500/40 transition-all">
                            {/* Home Team */}
                            <div className="flex flex-col items-center gap-1.5 flex-1 text-center min-w-0">
                                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted/80 dark:bg-black/40 backdrop-blur-sm border border-border dark:border-white/15 p-2 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    {homeLogo ? (
                                        <Image src={homeLogo} alt={homeName} fill className="object-contain p-1.5" />
                                    ) : (
                                        <Shield className="w-6 h-6 text-orange-500" />
                                    )}
                                </div>
                                <span className="text-xs font-black text-foreground truncate max-w-[85px] tracking-tight">{homeName}</span>
                            </div>

                            {/* VS Glass Badge */}
                            <div className="flex flex-col items-center justify-center shrink-0 px-2">
                                <div className="px-2.5 py-1 rounded-sm bg-orange-500/80 backdrop-blur-md border border-orange-300/40 text-white font-black text-[11px] uppercase tracking-wider shadow-sm">
                                    VS
                                </div>
                            </div>

                            {/* Away Team */}
                            <div className="flex flex-col items-center gap-1.5 flex-1 text-center min-w-0">
                                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-muted/80 dark:bg-black/40 backdrop-blur-sm border border-border dark:border-white/15 p-2 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    {awayLogo ? (
                                        <Image src={awayLogo} alt={awayName} fill className="object-contain p-1.5" />
                                    ) : (
                                        <Shield className="w-6 h-6 text-orange-500" />
                                    )}
                                </div>
                                <span className="text-xs font-black text-foreground truncate max-w-[85px] tracking-tight">{awayName}</span>
                            </div>
                        </div>
                    </div>
                ) : event.image ? (
                    <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-muted flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-muted-foreground" />
                    </div>
                )}

                {/* Apply badge (top-right) */}
                {event.requiresApplication && (
                    <button
                        onClick={handleApplyDirect}
                        type="button"
                        className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-sm shadow-md transition-all uppercase tracking-wider cursor-pointer border border-orange-400/30"
                        title="Click to apply directly"
                    >
                        <ClipboardList className="w-3 h-3" />
                        Apply
                    </button>
                )}

                {/* Price badge (bottom-left) */}
                <div className="absolute bottom-3 left-3 z-20">
                    <span className="text-xs font-bold bg-background/90 backdrop-blur-sm text-foreground rounded-sm px-2.5 py-1 border border-border shadow-sm">
                        <span className="text-orange-500 font-black uppercase">{priceLabel}</span>
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col flex-1 gap-3">
                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${isSports
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20"
                        }`}>
                        {isSports ? "Sports Match" : "Event"}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-muted text-muted-foreground border border-border">
                        Regular
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2">
                    {event.title}
                </h3>

                {/* Date & Venue */}
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-orange-500" />
                        <span>{formattedDate}</span>
                    </div>
                    {event.venue && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-orange-500" />
                            <span className="line-clamp-1">{event.venue}</span>
                        </div>
                    )}
                </div>

                {/* Footer: countdown + full-width CTA button */}
                <div className="border-t border-border pt-3 mt-auto flex flex-col gap-3">
                    {countdown.expired ? (
                        <>
                            <p className="text-xs font-semibold text-red-500 text-center">Event ended</p>
                            <Link
                                href={href}
                                className="w-full text-center bg-muted hover:bg-muted/80 text-foreground text-xs font-extrabold uppercase tracking-wider py-2.5 rounded-sm border border-border transition-colors"
                            >
                                View Details
                            </Link>
                        </>
                    ) : (
                        <>
                            {/* Countdown row */}
                            <div className="flex items-center justify-between gap-1">
                                <CountdownBox value={countdown.days} label="Days" />
                                <span className="text-muted-foreground/60 font-bold text-sm">:</span>
                                <CountdownBox value={countdown.hrs} label="Hrs" />
                                <span className="text-muted-foreground/60 font-bold text-sm">:</span>
                                <CountdownBox value={countdown.mins} label="Min" />
                                <span className="text-muted-foreground/60 font-bold text-sm">:</span>
                                <CountdownBox value={countdown.secs} label="Sec" />
                            </div>

                            {/* Full-width Primary CTA */}
                            {canSellTickets ? (
                                <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
                                    <DialogTrigger asChild>
                                        <button
                                            type="button"
                                            className="w-full text-center bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-extrabold uppercase tracking-wider py-2.5 rounded-sm transition-all shadow-sm shadow-orange-500/20 cursor-pointer"
                                        >
                                            {primaryCtaText}
                                        </button>
                                    </DialogTrigger>
                                    <BookRegularEventModal event={event} />
                                </Dialog>
                            ) : (
                                <Link
                                    href={primaryCtaHref}
                                    className="w-full text-center bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-extrabold uppercase tracking-wider py-2.5 rounded-sm transition-all shadow-sm shadow-orange-500/20"
                                >
                                    {primaryCtaText}
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
