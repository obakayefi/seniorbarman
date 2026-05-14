"use client"
import Hero from "@/components/ui/hero";
import HowItWorks from "@/components/ui/how-it-works";
import UpcomingMatches from "@/components/ui/upcoming-matches";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { CalendarX2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function RangersPage() {
    const [nextMatch, setNextMatch] = useState<any>(null)
    const [upcomingMatches, setUpcomingMatches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadMatches() {
            try {
                const { data } = await api.get("/events?type=sports")
                setUpcomingMatches(data.events || [])
                setNextMatch(data.events?.[0] || null)
            } catch (error) {
                console.error("Failed to load matches", error)
            } finally {
                setLoading(false)
            }
        }
        loadMatches()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center">
                <Spinner className="text-red-600 scale-150" />
            </div>
        )
    }

    if (upcomingMatches.length === 0) {
        return (
            <section className="min-h-screen flex items-center justify-center bg-black relative px-4 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center z-0 opacity-[0.15] filter grayscale blur-sm" style={{ backgroundImage: 'url(/header-bg.png)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40 z-10" />

                <div className="relative z-20 flex flex-col items-center justify-center p-10 sm:p-16 rounded-[3rem] bg-zinc-900/30 backdrop-blur-2xl border border-white/5 shadow-[0_0_60px_-15px_rgba(220,38,38,0.15)] my-4 group transition-all duration-700 hover:bg-zinc-900/50 hover:border-red-500/20 max-w-2xl w-full">
                    <div className="p-6 rounded-full bg-black/50 border border-white/5 mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-[inset_0_4px_20px_rgba(255,255,255,0.02)]">
                        <CalendarX2 size={56} className="text-zinc-600 group-hover:text-red-600 transition-colors duration-500" />
                    </div>
                    <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-4 text-center uppercase">
                        Season Break
                    </h3>
                    <p className="text-zinc-400 font-medium text-center leading-relaxed max-w-md mx-auto text-sm sm:text-base">
                        There are currently no scheduled Rangers FC fixtures. We are loading the new season's calendar. Please check back shortly!
                    </p>
                    <div className="mt-10 flex gap-2 justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-600/30" />
                        <div className="h-1.5 w-8 rounded-full bg-red-600" />
                        <div className="h-1.5 w-1.5 rounded-full bg-red-600/30" />
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className={''}>
            {/*<FloatingNav navItems={navItems}/>*/}

            <div className="relative h-[90vh] lg:h-[85vh] overflow-x-hidden text-white">
                {/* background image */}
                <div style={{ backgroundImage: 'url(/header-bg.png)' }} className="absolute inset-0 bg-cover h-[90vh] lg:h-[85vh] bg-center bg-no-repeat z-0" />

                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-red-600/30 z-10" />

                {/* content */}
                <div className="relative z-20 flex py-20 px-6 lg:px-12 xl:px-20 h-full max-w-[1600px] mx-auto">
                    <Hero nextMatch={nextMatch} />
                </div>
            </div>
            <HowItWorks />
            <UpcomingMatches
                upcomingMatches={upcomingMatches}
            />
            {/*<UpcomingEvents/>*/}
        </section>
    )
}