"use client"
import { Calendar1Icon, Clock, MapPin } from "lucide-react";
import { FaLocationPin } from "react-icons/fa6";
import { formatTime } from "@/lib/utils";
import { Dialog, DialogTrigger } from "./dialog";
import { BookEventModal } from "../modals/book-event";
import NButton from "../native/NButton";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { HunchoRoleChecker } from "@/lib/helpers";

function FootballMatch({ isNextMatch, match }: { isNextMatch?: boolean, match: any }) {
    const [dateString, setDateString] = useState("")
    const { user } = useApp()

    useEffect(() => {
        if (match.date) {
            setDateString(new Date(match.date).toDateString())
        }
    }, [match.date])

    return (
        <div className={`relative flex flex-col md:flex-row w-full bg-card rounded-sm overflow-hidden shadow-sm ${isNextMatch ? 'border-2 border-green-500/50' : 'border border-border'}`}>
            {/* Main Ticket Area - Match Details */}
            <div className="flex-1 p-6 relative">
                {isNextMatch && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-sm uppercase tracking-wider">
                        Next Match
                    </div>
                )}

                <div className="flex flex-col h-full justify-between gap-6">
                    {/* Teams */}
                    <div className="flex flex-col gap-4 items-center md:items-start">
                        <div className="flex items-center gap-4 w-full justify-center md:justify-start">
                            <h2 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight text-center md:text-left">{(match.homeTeam as any)?.name ?? match.homeTeam}</h2>
                            <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">VS</span>
                            <h2 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight text-center md:text-left">{(match.awayTeam as any)?.name ?? match.awayTeam}</h2>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 w-full pt-4 border-t border-dashed border-border">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                                <Calendar1Icon size={12} /> Date
                            </span>
                            <span className="text-foreground text-xs font-semibold">{dateString}</span>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                                <Clock size={12} /> Time
                            </span>
                            <span className="text-foreground text-xs font-semibold">
                                {match.date ? new Date(match.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : formatTime(match.time)}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                                <MapPin size={12} /> Venue
                            </span>
                            <span className="text-foreground text-xs font-semibold truncate">{match.venue}</span>
                        </div>
                    </div>
                </div>

                {/* Left Cutout (Visual only, simulates ticket notch) */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-r border-border"></div>
            </div>

            {/* Perforation Line */}
            <div className="relative hidden md:flex flex-col items-center justify-center">
                <div className="h-[90%] border-l-2 border-dashed border-border"></div>
                {/* Top/Bottom Cutouts for separator */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-background border-b border-border"></div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-background border-t border-border"></div>
            </div>

            {/* Action Area - Ticket Stub */}
            <div className="w-full md:w-48 bg-muted/30 p-6 flex flex-col justify-center gap-3 relative border-t md:border-t-0 md:border-l border-border border-dashed">
                {/* Right Cutout */}
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-l border-border hidden md:block"></div>

                <Dialog>
                    <DialogTrigger asChild>
                        <NButton className={'bg-green-700 hover:bg-green-600 text-white w-full font-bold shadow-md rounded-sm'}>
                            Buy Ticket
                        </NButton>
                    </DialogTrigger>
                    <BookEventModal eventId={(match as any)._id} />
                </Dialog>

                {HunchoRoleChecker(user?.role || "") && (<NButton
                    onClick={() => window.location.href = `/u/a/events/${match._id}/edit`}
                    className={'bg-muted hover:bg-muted/80 text-foreground border border-border w-full rounded-sm'}
                >
                    Edit Event
                </NButton>)}
            </div>
        </div>
    )
}

export default function UpcomingMatches({ upcomingMatches }: { upcomingMatches: any[] }) {

    return (
        <section className={'px-6 lg:px-12 xl:px-20 mb-20 max-w-[1600px] mx-auto'} id={'upcomingMatches'}>
            <div>
                <h2 className={'text-xl lg:text-3xl font-bold text-foreground'}>Upcoming Home Matches</h2>
                <span className={'text-muted-foreground text-xs'}>Secure your tickets for Enugu Rangers FC home games</span>
            </div>

            <section className={'flex flex-col md:grid md:grid-cols-2 gap-4 mt-10'}>
                {upcomingMatches.length ? upcomingMatches.map((match, index) => (
                    <FootballMatch key={match._id} match={match} isNextMatch={index === 0} />
                )) : <div><h3 className={'text-muted-foreground'}>Loading upcoming matches...</h3></div>}
            </section>
        </section>
    )
}