"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, MapPin, Calendar, Users, Heart, ArrowLeft, Loader2, Ticket } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { HunchoRoleChecker } from "@/lib/helpers";
import LandingEventCard from "@/components/landing/LandingEventCard";

export default function TeamHubPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useApp();
    const [team, setTeam] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFav, setIsFav] = useState(false);
    const [savingFav, setSavingFav] = useState(false);

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                setLoading(true);

                // Fetch team details
                try {
                    const teamRes = await api.get(`/teams/${id}`);
                    if (teamRes.data?.success) {
                        setTeam(teamRes.data.team);
                    }
                } catch (e) {
                    console.error("Team fetch error:", e);
                }

                // Fetch sports events
                try {
                    const eventsRes = await api.get("/events?type=sports");
                    if (eventsRes.data?.events) {
                        const teamMatches = eventsRes.data.events.filter(
                            (e: any) =>
                                String(e.homeTeam?._id || e.homeTeam) === id ||
                                String(e.awayTeam?._id || e.awayTeam) === id
                        );
                        setEvents(teamMatches);
                    }
                } catch (e) {
                    console.error("Events fetch error:", e);
                }

                // Check favorite status
                try {
                    const favRes = await api.get("/user/favorite-team").catch(() => null);
                    if (favRes?.data?.favoriteTeam) {
                        const favId = favRes.data.favoriteTeam._id || favRes.data.favoriteTeam;
                        setIsFav(favId === id);
                    } else {
                        const localFav = typeof window !== "undefined" ? localStorage.getItem("favoriteTeamId") : null;
                        setIsFav(localFav === id);
                    }
                } catch (e) {
                    // Ignore fav check error for guests
                }
            } catch (error) {
                console.error("Failed to load team hub", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamData();
    }, [id]);

    const toggleFavorite = async () => {
        try {
            setSavingFav(true);
            const newFav = isFav ? null : id;

            // Always update state & local storage for instant responsiveness across tabs/navbar
            setIsFav(!isFav);
            if (newFav) {
                localStorage.setItem("favoriteTeamId", newFav);
            } else {
                localStorage.removeItem("favoriteTeamId");
            }
            window.dispatchEvent(new Event("storage"));

            if (user) {
                const res = await api.post("/user/favorite-team", { teamId: newFav });
                if (res.data?.success) {
                    toast.success(newFav ? `${team?.name} set as favorite team!` : "Removed from favorites");
                }
            } else {
                toast.success(newFav ? `${team?.name} set as favorite team locally!` : "Removed from favorites");
            }
        } catch (error) {
            console.error("Favorite toggle error:", error);
            // Rollback on error
            setIsFav(isFav);
            toast.error("Failed to update favorite team");
        } finally {
            setSavingFav(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <p className="text-sm font-medium text-muted-foreground">Loading team hub...</p>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center py-20 px-4 text-center gap-4">
                <div className="p-4 rounded-full bg-muted border border-border">
                    <Shield className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Team Hub Not Found</h2>
                <p className="text-muted-foreground text-sm max-w-md">
                    The football team you are looking for could not be found or may have been removed.
                </p>
                <Link
                    href="/teams"
                    className="mt-2 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-sm transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Browse All Teams
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-10 px-4 md:px-8 transition-colors">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Back Link */}
                <Link href="/teams" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Teams Directory
                </Link>

                {/* Team Hero Header */}
                <div className="relative bg-card border border-border rounded-sm p-6 md:p-8 overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-sm bg-muted border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
                                {team.logo ? (
                                    <Image src={team.logo} alt={team.name} fill className="object-contain p-3" />
                                ) : (
                                    <Shield className="w-10 h-10 text-orange-500" />
                                )}
                            </div>

                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">{team.name}</h1>
                                    {isFav && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-500/15 border border-orange-500/30 px-2.5 py-0.5 rounded-sm">
                                            ⭐ Favorite Team
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                                    {team.stadium && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                            {team.stadium}
                                        </span>
                                    )}
                                    {HunchoRoleChecker(user?.role) && team.managers && team.managers.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5 text-blue-500" />
                                            {team.managers.map((m: any) => `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email).join(', ')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Favorite Button */}
                        <button
                            onClick={toggleFavorite}
                            disabled={savingFav}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs font-bold transition-all shadow-sm ${
                                isFav
                                    ? "bg-orange-500 text-white shadow-orange-500/25"
                                    : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                            <span>{isFav ? "Favorite Team" : "Set as Favorite Team"}</span>
                        </button>
                    </div>
                </div>

                {/* Fixtures & Tickets Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-orange-500" />
                                Upcoming Match Fixtures
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Official match tickets hosted by {team.name}
                            </p>
                        </div>
                    </div>

                    {events.length === 0 ? (
                        <div className="py-16 text-center bg-card border border-dashed border-border rounded-sm text-muted-foreground space-y-2 shadow-sm">
                            <Calendar className="w-8 h-8 text-muted-foreground mx-auto" />
                            <p className="font-medium text-sm text-foreground">No scheduled match tickets right now for {team.name}.</p>
                            <p className="text-xs text-muted-foreground">Check back soon for new fixture announcements!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map((event) => (
                                <LandingEventCard
                                    key={event._id}
                                    event={{
                                        _id: String(event._id),
                                        title: event.title || `${event.homeTeam?.name || 'Home'} vs ${event.awayTeam?.name || 'Away'}`,
                                        date: event.date?.toISOString?.() ?? String(event.date),
                                        venue: event.venue || team.stadium || "",
                                        image: event.image,
                                        type: event.type || "sports",
                                        homeTeam: event.homeTeam,
                                        awayTeam: event.awayTeam,
                                        requiresApplication: event.requiresApplication,
                                        ticketTypes: event.ticketTypes,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
