"use client";

import React from "react";
import { Sparkles, Radio } from "lucide-react";

const announcements = [
    "⚡ Buy tickets for upcoming Football Matches — instant e-tickets delivered to your phone!",
    "🎶 Discover Afrobeats concerts, parties, and nightlife events across Enugu.",
    "🏆 Support your favorite team live at the stadium this weekend!",
    "✨ Host and manage your own events effortlessly on Senior Barman.",
];

export default function AnnouncementBanner() {
    return (
        <div className="w-full bg-card/95 backdrop-blur-xl border-b border-border text-foreground py-2.5 px-4 text-xs font-medium z-30 relative overflow-hidden transition-colors">
            <div className="max-w-7xl mx-auto flex items-center gap-4">
                {/* Glassmorphism Badge on Left */}
                <div className="flex-shrink-0 flex items-center gap-2 bg-orange-500/15 backdrop-blur-md text-orange-500 dark:text-orange-400 border border-orange-500/30 px-3 py-1 rounded-sm z-10 shadow-sm">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-orange-500 dark:text-orange-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">LIVE UPDATES</span>
                </div>

                {/* Glass Mask Marquee */}
                <div className="relative overflow-hidden flex-1 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                    <div className="flex whitespace-nowrap animate-[marquee_32s_linear_infinite] hover:[animation-play-state:paused]">
                        {[...announcements, ...announcements].map((text, i) => (
                            <span key={i} className="mx-8 text-foreground/80 flex items-center gap-2 font-medium">
                                <Sparkles className="w-3 h-3 text-orange-500 dark:text-orange-400 inline" />
                                {text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
