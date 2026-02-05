"use client"
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { MdStadium } from "react-icons/md";
import { FaClock } from "react-icons/fa6";
import { BsFillCalendarDateFill } from "react-icons/bs";
import api from "@/lib/axios";
import { Spinner } from "@/components/ui/spinner";
import { formatEvent, formatTime } from "@/lib/utils";
import Ticket from "@/app/u/tickets/Ticket";

export default function PublicTicketView() {
    const [currentTicket, setCurrentTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();

    const fetchTicketDetails = async () => {
        try {
            const token = params.hashToken;
            const { data } = await api.get(`/tickets/preview/${token}`);
            const eventFormatted = formatEvent(data.event);
            setCurrentTicket({ ...data, awayLogo: eventFormatted.awayLogo, homeLogo: eventFormatted.homeLogo });
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
                <p className="text-zinc-400 text-lg font-light">Loading Ticket Details</p>
                <Spinner />
            </div>
        );
    }

    if (!currentTicket?.ticket) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-red-400 text-xl font-medium">Ticket Not Found</p>
                <p className="text-zinc-500">The link may be invalid or the ticket has been removed.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
            <div className="text-center mb-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    Ticket Details
                </h1>
                <p className="text-zinc-500 mt-2">Verified Senior Barman Ticket</p>
            </div>

            <div className='bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm rounded-2xl justify-center flex flex-col items-center py-10 shadow-2xl'>
                {currentTicket?.event?.type === 'sports' ? (
                    <section className='flex flex-col md:flex-row items-center gap-8 md:gap-16'>
                        <div className='flex flex-col items-center gap-4'>
                            <Image src={currentTicket.homeLogo || "/clubs/rangers-logo.png"} loading={'eager'} alt='home logo' height={100} width={100}
                                className={'w-20 md:w-32 hover:scale-105 duration-300'} />
                            <h2 className="text-xl md:text-2xl font-semibold text-zinc-100">{currentTicket?.event?.homeTeam}</h2>
                        </div>

                        <div className="flex flex-col items-center">
                            <span className='text-2xl font-bold text-orange-500 bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20'>VS</span>
                        </div>

                        <div className='flex flex-col items-center gap-4'>
                            <Image src={currentTicket.awayLogo || "/clubs/rangers-logo.png"} loading={'eager'} alt='away logo' height={100} width={100}
                                className={'w-20 md:w-32 hover:scale-105 duration-300'} />
                            <h2 className="text-xl md:text-2xl font-semibold text-zinc-100">{currentTicket?.event?.awayTeam}</h2>
                        </div>
                    </section>
                ) : (
                    <section className="flex flex-col items-center gap-6 px-10 text-center">
                        {currentTicket?.event?.image && (
                            <div className="w-full max-w-md h-48 rounded-xl overflow-hidden mb-4 border border-zinc-800">
                                <img src={currentTicket.event.image} alt="event poster" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <h2 className="text-2xl md:text-4xl font-bold text-zinc-100 uppercase tracking-tight">
                            {currentTicket?.event?.title}
                        </h2>
                    </section>
                )}

                <section className='grid grid-cols-1 md:grid-cols-3 gap-10 mt-16 w-full px-10'>
                    <div className="flex flex-col items-center bg-zinc-800/30 p-4 rounded-xl border border-zinc-700/30">
                        <MdStadium className='text-orange-400 mb-2' size={28} />
                        <p className='text-zinc-500 text-sm uppercase tracking-wider mb-1'>Venue</p>
                        <p className='text-zinc-200 font-medium text-center'>{currentTicket?.event?.venue}</p>
                    </div>
                    <div className="flex flex-col items-center bg-zinc-800/30 p-4 rounded-xl border border-zinc-700/30">
                        <FaClock className='text-orange-400 mb-2' size={24} />
                        <p className='text-zinc-500 text-sm uppercase tracking-wider mb-1'>Time</p>
                        <p className='text-zinc-200 font-medium'>{formatTime(currentTicket?.event?.time)}</p>
                    </div>
                    <div className="flex flex-col items-center bg-zinc-800/30 p-4 rounded-xl border border-zinc-700/30">
                        <BsFillCalendarDateFill className='text-orange-400 mb-2' size={24} />
                        <p className='text-zinc-500 text-sm uppercase tracking-wider mb-1'>Date</p>
                        <p className='text-zinc-200 font-medium'>{new Date(currentTicket?.event?.date).toDateString()}</p>
                    </div>
                </section>
            </div>

            <div className="flex justify-center mt-4">
                <div className="max-w-md w-full">
                    <Ticket ticket={currentTicket.ticket} toPrint={false} />
                </div>
            </div>

            <div className="mt-8 text-center bg-zinc-900/40 p-6 rounded-xl border border-dashed border-zinc-800">
                <p className="text-zinc-400 text-sm italic">
                    "Present the QR code on your ticket at the entrance for verification"
                </p>
            </div>
        </div>
    );
}
