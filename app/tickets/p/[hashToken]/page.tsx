"use client"
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { MdStadium } from "react-icons/md";
import { FaClock } from "react-icons/fa6";
import { BsFillCalendarDateFill } from "react-icons/bs";
import api from "@/lib/axios";
import { Spinner } from "@/components/ui/spinner";
import { formatTime, giveLogo } from "@/lib/utils";
import TicketCarousel from "@/app/u/tickets/[id]/TicketCarousel";

export default function PublicTicketView() {
    const [currentTicket, setCurrentTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();

    const fetchTicketDetails = async () => {
        try {
            const token = params.hashToken;
            const { data } = await api.get(`/tickets/preview/${token}`);
            setCurrentTicket(data);
        } catch (e) {
            console.error("Error fetching ticket:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.hashToken) {
            fetchTicketDetails();
        }
    }, [params.hashToken]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Spinner />
                <p className="text-zinc-500 text-sm font-medium animate-pulse">Verifying Security Pass...</p>
            </div>
        );
    }

    if (!currentTicket?.ticket) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                    <span className="text-4xl">⚠️</span>
                </div>
                <div className="space-y-2">
                    <p className="text-red-400 text-xl font-black uppercase tracking-widest">Pass Not Found</p>
                    <p className="text-zinc-500 max-w-xs mx-auto">This verification link is invalid, expired, or the ticket has been voided by the organizer.</p>
                </div>
                <button
                    onClick={() => window.location.href = '/'}
                    className="bg-zinc-900 border border-white/5 hover:border-white/10 text-white px-8 py-3 rounded-xl transition-all font-bold"
                >
                    Back to Homepage
                </button>
            </div>
        );
    }

    const { ticket, event, user } = currentTicket;

    return (
        <div className="min-h-screen bg-black">
            {/* Immersive Header Section */}
            <div className="relative w-full overflow-hidden">
                {event?.type === 'event' ? (
                    <div
                        className="absolute inset-0 z-0 scale-110 blur-3xl opacity-30"
                        style={{
                            backgroundImage: `url(${event.image || 'https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-orange-500/10 to-transparent" />
                )}

                <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
                    <div className="flex flex-col items-center gap-2 mb-8">
                        <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2 drop-shadow-sm">Verification Portal</span>
                        <h1 className="text-3xl sm:text-4xl font-black text-white text-center tracking-tighter italic">
                            SENIOR BARMAN
                        </h1>
                        <div className="h-1 w-12 bg-orange-500 rounded-full mt-1" />
                    </div>

                    {event?.type === 'sports' ? (
                        <div className="w-full bg-zinc-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-8 shadow-2xl">
                            <div className="flex items-center justify-center gap-6 sm:gap-12 w-full">
                                <div className="flex flex-col items-center gap-4 flex-1">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-orange-500/30 transition-all duration-500">
                                        <Image src={(event.homeTeam as any)?.logo || giveLogo(event.homeTeam)} alt="home" height={100} width={100} className="w-16 h-16 sm:w-24 sm:h-24 object-contain group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <p className="text-white font-black text-sm sm:text-lg text-center leading-tight uppercase tracking-tighter">{(event.homeTeam as any)?.name ?? event.homeTeam}</p>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="text-2xl sm:text-3xl font-black text-orange-500 italic">VS</div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Matchday</p>
                                </div>

                                <div className="flex flex-col items-center gap-4 flex-1">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-orange-500/30 transition-all duration-500">
                                        <Image src={(event.awayTeam as any)?.logo || giveLogo(event.awayTeam)} alt="away" height={100} width={100} className="w-16 h-16 sm:w-24 sm:h-24 object-contain group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <p className="text-white font-black text-sm sm:text-lg text-center leading-tight uppercase tracking-tighter">{(event.awayTeam as any)?.name ?? event.awayTeam}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 w-full pt-8 border-t border-white/5">
                                <div className="flex flex-col items-center text-center gap-1">
                                    <MdStadium className="text-orange-500" size={20} />
                                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Venue</p>
                                    <p className="text-xs text-white font-bold">{event.venue}</p>
                                </div>
                                <div className="flex flex-col items-center text-center gap-1 border-x border-white/5">
                                    <FaClock className="text-orange-500" size={18} />
                                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Kickoff</p>
                                    <p className="text-xs text-white font-bold">{event.time}</p>
                                </div>
                                <div className="flex flex-col items-center text-center gap-1">
                                    <BsFillCalendarDateFill className="text-orange-500" size={18} />
                                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Date</p>
                                    <p className="text-xs text-white font-bold">{new Date(event.date).toLocaleDateString('en-GB')}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full relative rounded-3xl overflow-hidden shadow-2xl group">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                                style={{ backgroundImage: `url(${event.image || 'https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024'})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                            <div className="relative z-10 p-8 sm:p-12 flex flex-col items-center text-center space-y-4">
                                <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tighter uppercase italic">
                                    {event.type === 'sports' ? `${event.homeTeam?.name || event.homeTeam} vs ${event.awayTeam?.name || event.awayTeam}` : event.title}
                                </h1>

                                <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                                    <div className="flex items-center gap-2">
                                        <BsFillCalendarDateFill size={16} className="text-orange-500" />
                                        <p className="text-white font-bold text-sm tracking-tight">{new Date(event.date).toLocaleDateString('en-GB')}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaClock size={16} className="text-orange-500" />
                                        <p className="text-white font-bold text-sm tracking-tight">{event.time}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MdStadium size={18} className="text-orange-500" />
                                        <p className="text-white font-bold text-sm tracking-tight">{event.venue}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket Interaction Layer */}
            <div className="max-w-4xl mx-auto px-2 sm:px-4 pb-20 -mt-6 sm:-mt-16 relative z-20">
                <div className="bg-zinc-950/40 backdrop-blur-3xl border border-white/5 rounded-3xl sm:rounded-[40px] p-1 sm:p-6 shadow-2xl">
                    <TicketCarousel
                        tickets={[ticket]}
                        eventInfo={event}
                        user={user}
                    />
                </div>

                <div className="mt-12 text-center space-y-4 px-6">
                    <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-3xl backdrop-blur-sm">
                        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto italic">
                            "This is a verified digital access pass for Senior Barman events.
                            Unauthorized duplication or sharing of the secure QR code will result in immediate voiding of the pass."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
