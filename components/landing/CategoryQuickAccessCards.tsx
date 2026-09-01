"use client";

import React from "react";
import Link from "next/link";
import { GiSoccerBall } from "react-icons/gi";
import { MdCelebration } from "react-icons/md";
import { ArrowRight } from "lucide-react";

export default function CategoryQuickAccessCards() {
    return (
        <section className="w-full max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Football Matches Card */}
                <Link href="/teams" className="group relative overflow-hidden rounded-sm h-52 shadow-lg cursor-pointer block">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{
                            backgroundImage:
                                "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.75)), url('/nnamdi-azikiwe-stadium.jpg')",
                            backgroundSize: "cover",
                        }}
                    />
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-sm bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white border border-white/20 w-fit uppercase tracking-wider">
                            <GiSoccerBall className="text-green-400" />
                            Sports
                        </span>
                        <div>
                            <h3 className="text-white text-xl font-extrabold leading-tight mb-1">
                                Football Matches
                            </h3>
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className="text-xs font-bold text-white/70">View Teams &amp; Fixtures</span>
                                <ArrowRight className="w-3.5 h-3.5 text-white/70" />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Events / Concerts Card */}
                <Link href="/events" className="group relative overflow-hidden rounded-sm h-52 shadow-lg cursor-pointer block">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{
                            backgroundImage:
                                "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.75)), url('/party-in-the-park.jpeg')",
                            backgroundSize: "cover",
                        }}
                    />
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-sm bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white border border-white/20 w-fit uppercase tracking-wider">
                            <MdCelebration className="text-yellow-400" />
                            Events
                        </span>
                        <div>
                            <h3 className="text-white text-xl font-extrabold leading-tight mb-1">
                                Concerts &amp;
                                <br />Parties
                            </h3>
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className="text-xs font-bold text-white/70">Browse events</span>
                                <ArrowRight className="w-3.5 h-3.5 text-white/70" />
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </section>
    );
}
