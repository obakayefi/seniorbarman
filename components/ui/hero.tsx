"use client"
import { Calendar1 } from "lucide-react";
import { FaLocationPinLock } from "react-icons/fa6";
import NButton from "@/components/native/NButton";
import { redirect } from "next/navigation";
import HeroAction from "@/components/ui/hero-action";
import HeroCountdown from "@/components/ui/hero-countdown";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function Hero({ nextMatch }: { nextMatch: any }) {
    return (
        <header className={'flex flex-col xl:flex-row w-full items-center justify-between'}>
            <div className="flex gap-2 flex-col">
                <section className="bg-red-600 max-w-fit px-2 rounded mb-2">
                    <span>Official Ticketing Partner</span>
                </section>

                <section className={'flex flex-col gap-2'}>
                    <h2 className={'text-3xl font-semibold lg:text-6xl lg:font-bold'}><span className="text-red-600">Enugu Rangers</span>
                        <br /> Home Matches</h2>
                    <div className={'flex text-sm flex-col gap-1'}>
                        <p>Get your official match tickets for the Flying Antelopes.</p>
                        <p>Experience the thrill of Nigerian Premier Football League action at the Nnamdi Azikiwe
                            Stadium</p>
                    </div>
                    <p className={'text-red-600 font-semibold'}>NPFL 2025/2026 Season</p>
                </section>

                <section
                    className={'bg-black/60 px-4 rounded text-white w-full lg:max-w-fit justify-start flex flex-col gap-4 items-center py-4'}>
                    <div className="flex items-center gap-3 lg:border-r-1 border-b-1 w-full border-slate-800 lg:pl-2">
                        <Calendar1 className={'text-red-600'} size={24} />
                        <section className={'flex flex-col'}>
                            <span className={'text-sm'}>Next Match</span>
                            {nextMatch?.date ? (
                                <span className="text-lg">{new Date(nextMatch.date).toDateString()}</span>
                            ) : (
                                <div className="h-6 w-32 bg-red-600/20 animate-pulse rounded mt-1" />
                            )}
                        </section>
                    </div>

                    <div className="flex items-center w-full gap-3 lg:pl-2">
                        <FaLocationPinLock className={'text-red-600'} size={21} />
                        <section className={'flex flex-col'}>
                            <span className={'text-sm'}>Venue</span>
                            {nextMatch?.venue ? (
                                <span className="text-lg">{nextMatch.venue}</span>
                            ) : (
                                <div className="h-6 w-48 bg-red-600/20 animate-pulse rounded mt-1" />
                            )}
                        </section>
                    </div>
                </section>

                <section className={'mt-4'}>
                    {nextMatch?._id ? (
                        <HeroAction eventId={(nextMatch as any)._id} />
                    ) : (
                        <div className="h-12 w-48 bg-zinc-800 animate-pulse rounded-lg" />
                    )}
                </section>
            </div>

            <section className={'flex mx-auto border-1 lg:mx-0 border-zinc-950 rounded z-20 items-center mt-11'}>
                <div className={'bg-black/80 min-w-fit z-50 p-5'}>
                    <div className="border-b-1  border-gray-800">
                        <h2 className={'text-xs  lg:text-lg text-gray-400 uppercase'}>Next Match</h2>
                        <div
                            className="flex font-semibold gap-1 text-base md:text-lg pb-2 lg:text-xl items-center justify-between">
                            <h2>Enugu Rangers</h2>
                            <span
                                className={'text-white h-6 w-6 text-sm rounded-full bg-red-600 flex flex-col items-center justify-center font-normal'}>
                                vs
                            </span>
                            {nextMatch?.awayTeam ? (
                                <h2>{nextMatch.awayTeam}</h2>
                            ) : (
                                <div className="h-7 w-24 bg-zinc-800 animate-pulse rounded mx-2" />
                            )}
                        </div>
                    </div>
                    {nextMatch?.date ? (
                        <HeroCountdown targetDate={nextMatch.date} />
                    ) : (
                        <div className={'w-68 h-20 flex items-center justify-center'}>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-12 w-12 bg-zinc-800 animate-pulse rounded" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </header>
    )
}
