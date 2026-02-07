"use client"
import Hero from "@/components/ui/hero";
import HowItWorks from "@/components/ui/how-it-works";
import UpcomingMatches from "@/components/ui/upcoming-matches";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function RangersPage() {
    const [nextMatch, setNextMatch] = useState<any>(null)
    const [upcomingMatches, setUpcomingMatches] = useState([])

    useEffect(() => {
        async function loadMatches() {
            const { data } = await api.get("/events?type=sports")
            console.log({ data })
            setUpcomingMatches(data.events)
            setNextMatch(data.events[0])
        }
        loadMatches()
    }, [])

    return (
        <section className={''}>
            {/*<FloatingNav navItems={navItems}/>*/}

            <div className="relative h-[90vh] lg:h-[85vh] overflow-x-hidden text-white">
                {/* background image */}
                <div style={{ backgroundImage: 'url(/header-bg.png)' }} className="absolute inset-0 bg-cover h-[90vh] lg:h-[85vh] bg-center bg-no-repeat z-0" />

                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-red-600/30 z-10" />

                {/* content */}
                <div className="relative z-20 flex py-20 mx-4 lg:mx-60 h-full">
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