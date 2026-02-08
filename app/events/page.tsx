"use client"
import Hero from "@/components/ui/hero";
import HowItWorks from "@/components/ui/how-it-works";
import UpcomingMatches from "@/components/ui/upcoming-matches";
import { GiSmallFire } from "react-icons/gi";
import EventHero from "@/components/ui/event-hero";
import { RiTimer2Fill } from "react-icons/ri";
import { MdLocationPin } from "react-icons/md";
import UpcomingEvents from "@/components/ui/upcoming-events";
import Image from "next/image";
import NButton from "@/components/native/NButton";
import { FaLocationPin, FaLocationPinLock } from "react-icons/fa6";
import { SlLocationPin } from "react-icons/sl";
import RegularEventCard from "@/components/ui/RegularEventCard";
import { SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";


export default function EventsPage() {
    const [events, setEvents] = useState([])
    const [loadingEvents, setLoadingEvents] = useState(true)

    useEffect(() => {
        fetch('/api/events?type=event')
            .then(res => {
                console.log({ res })
                return res.json()
            })
            .then(data => {
                console.log({ events: data.events })
                setEvents(data.events)
            })
            .finally(() => setLoadingEvents(false))
    }, [])

    return (
        <section className={'flex flex-col gap-2'}>
            {/*<FloatingNav navItems={navItems}/>*/}

            <div className="relative h-[50vh] lg:h-[55vh] overflow-x-hidden text-white">
                {/* background image */}
                <div
                    className="absolute inset-0 bg-cover h-[50vh] lg:h-full bg-bottom bg-no-repeat z-0"
                    style={{
                        backgroundImage: "linear-gradient(to left, rgba(0,0,0,0.001), rgba(0,0,0,0.001)), url('/party-in-the-park.jpeg')"
                    }}
                />

                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />

                {/* content */}
                <div className="relative z-20 flex py-20 mx-4 lg:mx-60 md:mx-20 h-full">
                    <EventHero />
                </div>
            </div>
            <section className={'lg:pb-10 pb-4 px-2 flex flex-col lg:px-60 mt-10 '}>
                {/* <div className="bg-zinc-950 flex flex-col 2xl:flex-row gap-6 justify-between px-6 py-10 rounded-lg">
                    <div className="flex justify-between flex-col gap-4 md:gap-0 md:flex-row w-full items-center">
                        <div className="flex justify-between gap-6">
                            <section className="flex items-center gap-2">
                                <h3 className="flex items-center gap-2"><MdLocationPin /> Enugu, Nigeria</h3>
                            </section>
                            <section className="flex items-center gap-2">
                                <h3 className="flex items-center gap-2"><MdLocationPin /> Enugu, Nigeria</h3>
                            </section>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <NButton className="bg-green-500/90 hover:bg-green-300  text-zinc-900 text-center rounded-full">ALL EVENTS</NButton>
                            <NButton className="border-2 bg-transparent text-zinc-400 border-zinc-800 text-center rounded-full">CONCERTS</NButton>
                            <NButton className="border-2 bg-transparent text-zinc-400 border-zinc-800 text-center rounded-full">PARTIES</NButton>
                        </div>
                    </div>


                    <NButton className="px-8 w-full  2xl:max-w-fit py-6 hover:bg-zinc-900">
                        <span><SettingsIcon /></span> Advanced Filters
                    </NButton>
                </div> */}

                <div>
                    <h3 className={'text-3xl flex items-center uppercase gap-2 px-1 py-10'}>
                        <span className="text-amber-600"><GiSmallFire /></span> Events
                    </h3>

                    <div className="flex flex-col md:grid-cols-2 2xl:grid-cols-3 gap-2 md:grid gap-y-6 ">
                        {loadingEvents ? (
                            <div className="flex text-zinc-600 items-center gap-2"><span>Loading events</span> <Spinner /></div>
                        ) : events.length > 0 ? (
                            events.map((event: any) => (
                                <RegularEventCard key={event._id} event={event} />
                            ))
                        ) : (
                            <p>No events found</p>
                        )}
                    </div>
                </div>
            </section>

            {/*<HowItWorks/>*/}
            {/*<UpcomingMatches/>*/}
            {/*<UpcomingEvents/>*/}
        </section>
    )
}
