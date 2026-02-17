"use client"
import { Calendar1Icon, Clock, MapPin } from "lucide-react";
import { FaLocationPin } from "react-icons/fa6";
import { formatTime } from "@/lib/utils";
import { Dialog, DialogTrigger } from "./dialog";
import { BookEventModal } from "../modals/book-event";
import NButton from "../native/NButton";
import { useEffect, useState } from "react";

function FootballMatch({ isNextMatch, match }: { isNextMatch?: boolean, match: any }) {
    const [dateString, setDateString] = useState("")

    useEffect(() => {
        if (match.date) {
            setDateString(new Date(match.date).toDateString())
        }
    }, [match.date])

    return (
        <div className={`relative flex flex-col md:flex-row w-full bg-zinc-900 rounded-3xl overflow-hidden ${isNextMatch ? 'border-2 border-green-500/50' : 'border border-zinc-800'}`}>
            {/* Main Ticket Area - Match Details */}
            <div className="flex-1 p-6 relative">
                {isNextMatch && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                        Next Match
                    </div>
                )}

                <div className="flex flex-col h-full justify-between gap-6">
                    {/* Teams */}
                    <div className="flex flex-col gap-4 items-center md:items-start">
                        <div className="flex items-center gap-4 w-full justify-center md:justify-start">
                            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight text-center md:text-left">{match.homeTeam}</h2>
                            <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">VS</span>
                            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight text-center md:text-left">{match.awayTeam}</h2>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 w-full pt-4 border-t border-dashed border-zinc-800">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1">
                                <Calendar1Icon size={12} /> Date
                            </span>
                            <span className="text-zinc-300 text-xs font-semibold">{dateString}</span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1">
                                <Clock size={12} /> Time
                            </span>
                            <span className="text-zinc-300 text-xs font-semibold">
                                {match.date ? new Date(match.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : formatTime(match.time)}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1">
                                <MapPin size={12} /> Venue
                            </span>
                            <span className="text-zinc-300 text-xs font-semibold truncate">{match.venue}</span>
                        </div>
                    </div>
                </div>

                {/* Left Cutout (Visual only, simulates ticket notch) */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black"></div>
            </div>

            {/* Perforation Line (Vertical on Desktop, Horizontal by stacking logic handled via css if needed but structure here suggests flex-row desktop) */}
            <div className="relative hidden md:flex flex-col items-center justify-center">
                <div className="h-[90%] border-l-2 border-dashed border-zinc-800"></div>
                {/* Top/Bottom Cutouts for separator */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-black"></div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-black"></div>
            </div>

            {/* Action Area - Ticket Stub */}
            <div className="w-full md:w-48 bg-zinc-950/50 p-6 flex flex-col justify-center gap-3 relative border-t md:border-t-0 md:border-l border-zinc-800 border-dashed">
                {/* Right Cutout */}
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black hidden md:block"></div>
                {/* Mobile horizontal cutout indicators if needed, but keeping simple */}

                <Dialog>
                    <DialogTrigger asChild>
                        <NButton className={'bg-green-600 hover:bg-green-500 text-white w-full font-bold shadow-lg shadow-green-900/20'}>
                            Buy Ticket
                        </NButton>
                    </DialogTrigger>
                    <BookEventModal eventId={(match as any)._id} />
                </Dialog>

                <NButton
                    onClick={() => window.location.href = `/u/a/events/${match._id}/edit`}
                    className={'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 w-full'}
                >
                    Edit Event
                </NButton>
            </div>
        </div>
    )
}

export default function UpcomingMatches({ upcomingMatches }: { upcomingMatches: [] }) {

    return (
        <section className={'px-2 xl:px-60 mb-20'} id={'upcomingMatches'}>
            <div>
                <h2 className={'text-xl lg:text-3xl'}>Upcoming Home Matches</h2>
                <span className={'text-gray-400 text-xs'}>Secure your tickets for Enugu Rangers FC home games</span>
            </div>

            <section className={'flex flex-col md:grid md:grid-cols-2 gap-4 mt-10'}>
                {upcomingMatches.length ? upcomingMatches.map((match, index) => (
                    <FootballMatch match={match} isNextMatch={index === 0} />
                )) : <div><h3 className={'text-zinc-600'}>Loading upcoming matches</h3></div>}
            </section>
        </section>
    )
}