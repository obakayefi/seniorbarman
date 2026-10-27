"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, MapPin, Users, Heart, ArrowRight, Loader2, Search } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";
import { HunchoRoleChecker } from "@/lib/helpers";

export default function TeamsPage() {
    const { user } = useApp();
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [favoriteTeamId, setFavoriteTeamId] = useState<string | null>(null);
    const [savingFav, setSavingFav] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeamsAndFav = async () => {
            try {
                setLoading(true);
                const [teamsRes, favRes] = await Promise.all([
                    api.get("/teams"),
                    api.get("/user/favorite-team").catch(() => null),
                ]);

                if (teamsRes.data?.success) {
                    setTeams(teamsRes.data.teams);
                }
                if (favRes?.data?.favoriteTeam) {
                    setFavoriteTeamId(favRes.data.favoriteTeam._id || favRes.data.favoriteTeam);
                } else {
                    const localFav = typeof window !== "undefined" ? localStorage.getItem("favoriteTeamId") : null;
                    if (localFav) setFavoriteTeamId(localFav);
                }
            } catch (error) {
                console.error("Failed to load teams", error);
                toast.error("Failed to load teams");
            } finally {
                setLoading(false);
            }
        };

        fetchTeamsAndFav();
    }, []);

    const toggleFavorite = async (teamId: string) => {
        try {
            setSavingFav(teamId);
            const isFav = favoriteTeamId === teamId;
            const newFav = isFav ? null : teamId;

            setFavoriteTeamId(newFav);
            if (newFav) {
                localStorage.setItem("favoriteTeamId", newFav);
            } else {
                localStorage.removeItem("favoriteTeamId");
            }
            window.dispatchEvent(new Event("storage"));

            if (user) {
                const res = await api.post("/user/favorite-team", { teamId: newFav });
                if (res.data?.success) {
                    toast.success(newFav ? "Favorite team updated!" : "Favorite team removed");
                }
            } else {
                toast.success(newFav ? "Favorite team saved locally!" : "Favorite team removed");
            }
        } catch (error) {
            console.error("Favorite toggle error:", error);
            setFavoriteTeamId(favoriteTeamId);
            toast.error("Failed to update favorite team");
        } finally {
            setSavingFav(null);
        }
    };

    const filteredTeams = teams.filter(
        (t) =>
            t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.stadium?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors py-10 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold mb-3">
                            <Shield className="w-3.5 h-3.5" />
                            Football Clubs Directory
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Explore Teams &amp; Stadiums</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Pick your favorite club to personalize match schedules and buy match tickets.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search team or stadium..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-sm bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-[1.5px] focus:ring-orange-500 focus:border-orange-500 shadow-sm transition-all"
                        />
                    </div>
                </div>

                {/* Teams Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                        <p className="text-sm font-medium">Loading football clubs...</p>
                    </div>
                ) : filteredTeams.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-sm border border-dashed border-border text-muted-foreground">
                        No teams found matching "{searchQuery}"
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map((team) => {
                            const isFav = favoriteTeamId === team._id;
                            return (
                                <div
                                    key={team._id}
                                    className={`group relative bg-card text-card-foreground border ${
                                        isFav ? "border-orange-500/60 shadow-lg shadow-orange-950/20" : "border-border"
                                    } rounded-sm p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between shadow-sm`}
                                >
                                    {/* Favorite Toggle Button */}
                                    <button
                                        onClick={() => toggleFavorite(team._id)}
                                        disabled={savingFav === team._id}
                                        className={`absolute top-4 right-4 p-2 rounded-sm transition-all ${
                                            isFav
                                                ? "bg-orange-500 text-white shadow-md shadow-orange-900/40"
                                                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                        }`}
                                        title={isFav ? "Favorite club (Click to remove)" : "Set as favorite club"}
                                    >
                                        <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                                    </button>

                                    <div>
                                        {/* Logo / Badge */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="relative w-14 h-14 rounded-sm bg-muted overflow-hidden flex items-center justify-center border border-border flex-shrink-0">
                                                {team.logo ? (
                                                    <Image
                                                        src={team.logo}
                                                        alt={team.name}
                                                        fill
                                                        className="object-contain p-2"
                                                    />
                                                ) : (
                                                    <Shield className="w-7 h-7 text-orange-500" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground group-hover:text-orange-500 transition-colors leading-tight">
                                                    {team.name}
                                                </h3>
                                                {isFav && (
                                                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-sm border border-orange-500/20">
                                                        ⭐ Your Favorite Team
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div className="space-y-2 text-xs text-muted-foreground mb-6">
                                            {team.stadium && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                                                    <span>{team.stadium}</span>
                                                </div>
                                            )}
                                            {HunchoRoleChecker(user?.role) && team.managers && team.managers.length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                                    <span>{team.managers.length} Managed Team</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Links */}
                                    <div className="flex items-center gap-2 pt-4 border-t border-border">
                                        <Link
                                            href={`/teams/${team._id}`}
                                            className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2.5 rounded-sm transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            View Team Hub
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
