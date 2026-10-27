"use client"
import Hero from "@/components/ui/hero";
import HowItWorks from "@/components/ui/how-it-works";
import UpcomingMatches from "@/components/ui/upcoming-matches";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { CalendarX2, Heart, Shield, Sparkles } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

export default function RangersPage() {
    const { user } = useApp();
    const [allMatches, setAllMatches] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [favoriteTeam, setFavoriteTeam] = useState<any>(null);
    const [filterByFavorite, setFilterByFavorite] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMatchesAndFav() {
            try {
                const [eventsRes, teamsRes, favRes] = await Promise.all([
                    api.get("/events?type=sports"),
                    api.get("/teams"),
                    api.get("/user/favorite-team").catch(() => null),
                ]);

                const matches = eventsRes.data?.events || [];
                setAllMatches(matches);

                const teamList = teamsRes.data?.teams || [];
                setTeams(teamList);

                let favObj = favRes?.data?.favoriteTeam;
                if (!favObj && typeof window !== "undefined") {
                    const localFavId = localStorage.getItem("favoriteTeamId");
                    if (localFavId) {
                        favObj = teamList.find((t: any) => t._id === localFavId);
                    }
                }
                setFavoriteTeam(favObj || null);
            } catch (error) {
                console.error("Failed to load matches", error);
            } finally {
                setLoading(false);
            }
        }
        loadMatchesAndFav();
    }, []);

    const handleSelectFavorite = async (teamId: string) => {
        try {
            const teamObj = teams.find((t) => t._id === teamId);
            setFavoriteTeam(teamObj || null);
            setFilterByFavorite(true);

            if (user) {
                await api.post("/user/favorite-team", { teamId });
                toast.success(`${teamObj?.name} saved as favorite team!`);
            } else {
                localStorage.setItem("favoriteTeamId", teamId);
                toast.success(`${teamObj?.name} saved as favorite team locally!`);
            }
        } catch (error) {
            toast.error("Failed to save favorite team");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center">
                <Spinner className="text-red-600 scale-150" />
            </div>
        );
    }

    // Filter matches based on favorite team setting
    const displayedMatches =
        filterByFavorite && favoriteTeam
            ? allMatches.filter(
                  (m) =>
                      String(m.homeTeam?._id || m.homeTeam) === String(favoriteTeam._id) ||
                      String(m.awayTeam?._id || m.awayTeam) === String(favoriteTeam._id)
              )
            : allMatches;

    const nextMatch = displayedMatches[0] || allMatches[0] || null;

    return (
        <section className="bg-black min-h-screen">
            {/* Favorite Team Personalization Bar */}
            <div className="w-full bg-zinc-900 border-b border-zinc-800 py-3 px-4 text-xs font-semibold">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-zinc-300">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        {favoriteTeam ? (
                            <span>
                                Showing matches for <strong className="text-white">{favoriteTeam.name}</strong>
                            </span>
                        ) : (
                            <span>
                                <Sparkles className="inline w-3.5 h-3.5 text-orange-400 mr-1" />
                                Pick your favorite football club to tailor your match feed!
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Favorite Team Dropdown */}
                        <select
                            value={favoriteTeam?._id || ""}
                            onChange={(e) => handleSelectFavorite(e.target.value)}
                            className="bg-zinc-800 text-white border border-zinc-700 text-xs rounded-full px-3 py-1.5 focus:outline-none focus:border-red-500"
                        >
                            <option value="" disabled>-- Select Favorite Club --</option>
                            {teams.map((t) => (
                                <option key={t._id} value={t._id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>

                        {favoriteTeam && (
                            <button
                                onClick={() => setFilterByFavorite(!filterByFavorite)}
                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-full border border-zinc-700 transition-colors"
                            >
                                {filterByFavorite ? "Show All Teams" : `Show ${favoriteTeam.name} Only`}
                            </button>
                        )}

                        <Link
                            href="/teams"
                            className="text-orange-400 hover:text-orange-300 flex items-center gap-1 font-bold text-xs"
                        >
                            <Shield className="w-3.5 h-3.5" />
                            All Clubs Directory
                        </Link>
                    </div>
                </div>
            </div>

            {displayedMatches.length === 0 ? (
                <section className="min-h-[70vh] flex items-center justify-center bg-black relative px-4 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center z-0 opacity-[0.15] filter grayscale blur-sm"
                        style={{ backgroundImage: "url(/header-bg.png)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40 z-10" />

                    <div className="relative z-20 flex flex-col items-center justify-center p-10 sm:p-16 rounded-[3rem] bg-zinc-900/30 backdrop-blur-2xl border border-white/5 shadow-[0_0_60px_-15px_rgba(220,38,38,0.15)] my-4 max-w-2xl w-full">
                        <div className="p-6 rounded-full bg-black/50 border border-white/5 mb-8">
                            <CalendarX2 size={56} className="text-zinc-600" />
                        </div>
                        <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-4 text-center uppercase">
                            No Fixtures Found
                        </h3>
                        <p className="text-zinc-400 font-medium text-center leading-relaxed max-w-md mx-auto text-sm sm:text-base mb-6">
                            {favoriteTeam
                                ? `No upcoming fixtures scheduled for ${favoriteTeam.name} right now.`
                                : "There are currently no scheduled sports fixtures."}
                        </p>
                        {favoriteTeam && (
                            <button
                                onClick={() => setFilterByFavorite(false)}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-3 rounded-full transition-colors"
                            >
                                View All Matches
                            </button>
                        )}
                    </div>
                </section>
            ) : (
                <>
                    <div className="relative h-[90vh] lg:h-[85vh] overflow-x-hidden text-white">
                        <div
                            style={{ backgroundImage: "url(/header-bg.png)" }}
                            className="absolute inset-0 bg-cover h-[90vh] lg:h-[85vh] bg-center bg-no-repeat z-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-red-600/30 z-10" />
                        <div className="relative z-20 flex py-20 px-6 lg:px-12 xl:px-20 h-full max-w-[1600px] mx-auto">
                            <Hero nextMatch={nextMatch} />
                        </div>
                    </div>
                    <HowItWorks />
                    <UpcomingMatches upcomingMatches={displayedMatches} />
                </>
            )}
        </section>
    );
}