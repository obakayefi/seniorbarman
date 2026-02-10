"use client"
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import Image from "next/image";
import { giveLogo } from "@/lib/utils";
import { MdStadium } from "react-icons/md";
import { FaClock } from "react-icons/fa6";
import { BsFillCalendarDateFill } from "react-icons/bs";
import BulkTicketView from "@/app/u/tickets/BulkTicketView";
import RegularTicketView from "@/app/u/tickets/RegularTicketView";
import TicketCarousel from "./TicketCarousel";
import { useApp } from "@/context/AppContext";

export default function TicketDetailView() {
    const [tickets, setTickets] = useState([])
    const [eventInfo, setEventInfo] = useState<any>({})
    const [ticketSummary, setTicketSummary] = useState<{}[]>([])
    const params = useParams()
    const { user } = useApp()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function getTickets() {
            const { data } = await api.get(`/tickets/${params.id}`);
            setEventInfo(data.response.event);
            setTickets(data.response.tickets.tickets);
            setTicketSummary(data.response.summary);
            setLoading(false);
        }
        getTickets();
    }, [params.id])

    return (
        <>
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <h2 className="text-zinc-500">Getting Ticket Details...</h2>
                </div>
            ) : tickets.length ? (
                <div>
                    <div className="mb-6">
                        <Link href={'/u/tickets'} className={'text-zinc-700 flex items-center gap-2'}>
                            <MoveLeft />
                            <span className={'text-zinc-700'}>Back to Tickets</span>
                        </Link>
                    </div>

                    {/* Sport View */}
                    {eventInfo?.type === 'sports' ? (
                        <div className="rounded-xl overflow-hidden">
                            <div className='bg-zinc-950/90 border-zinc-900 border-2 rounded-xl justify-center flex flex-col items-center mb-4 py-6'>
                                <section className='flex flex-col sm:flex-row items-center gap-6 md:gap-10 mr-0 md:mr-5'>
                                    <div className='flex md:flex-row flex-col-reverse text-center gap-2 items-center'>
                                        <h2 className="text-sm lg:text-xl">{eventInfo?.homeTeam}</h2>
                                        <Image className={'w-12 md:w-24'} src={giveLogo(eventInfo?.homeTeam)} alt='logo'
                                            height={100}
                                            width={150} />
                                    </div>
                                    <span
                                        className='text-xl text-orange-400 bg-zinc-900 p-2 h-10 w-10 flex items-center justify-center rounded-full'>vs</span>
                                    <div className='flex md:flex-row flex-col text-center gap-2 items-center'>
                                        <Image className={'w-12 md:w-24'} src={giveLogo(eventInfo?.awayTeam)} alt='logo'
                                            height={100}
                                            width={125} />
                                        <h2 className="text-sm lg:text-xl">{eventInfo?.awayTeam}</h2>
                                    </div>
                                </section>

                                <section className='bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6 mt-4'>
                                    <div className='flex flex-col md:flex-row gap-6 sm:gap-10 justify-center'>
                                        <div className="flex-col flex gap-1 items-center">
                                            <MdStadium className='text-orange-400' size={20} />
                                            <p className='text-slate-500 text-xs sm:text-sm'>Venue</p>
                                            <p className='text-orange-400 text-sm sm:text-base'>{eventInfo?.venue}</p>
                                        </div>
                                        <div className="flex-col flex gap-1 items-center">
                                            <FaClock className='text-orange-400' size={20} />
                                            <p className='text-slate-500 text-xs sm:text-sm'>Time</p>
                                            <p className='text-orange-400 text-sm sm:text-base'>{eventInfo?.time}</p>
                                        </div>
                                        <div className="flex-col flex gap-1 items-center">
                                            <BsFillCalendarDateFill className='text-orange-400' size={20} />
                                            <p className='text-slate-500 text-xs sm:text-sm'>Date</p>
                                            <p className='text-orange-400 text-sm sm:text-base'>{new Date(eventInfo?.date).toDateString()}</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* <section className='flex items-center flex-col md:flex-row w-full gap-2 justify-center text-center'>
                                {tickets.length < 5 ? ticketSummary?.map((summary: any, index) => (
                                    <div
                                        key={index}
                                        className='text-center bg-zinc-800 w-full p-2 px-3 lg:max-w-fit rounded cursor-pointer hover:bg-zinc-700 duration-100'>
                                        <h4 className='text-zinc-400'>{summary.name}</h4>
                                        <span className='text-2xl text-zinc-200'>{summary.value}</span>
                                    </div>
                                )) : null}
                            </section> */}

                            <section className="mt-6">
                                <TicketCarousel tickets={tickets} user={user} eventInfo={eventInfo} />
                            </section>
                        </div>
                    ) : eventInfo?.type === 'event' ? (
                        <div className="rounded-xl overflow-hidden">
                            {/* Event View with poster background */}
                            <div
                                className='relative border-zinc-900 border-2 rounded-xl overflow-hidden transition-all duration-500'
                                style={{
                                    backgroundImage: `url(${eventInfo.image || 'https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024'})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-900/40 to-black/20" />

                                {/* Glassmorphic Content Card */}
                                <div className="relative z-10 bg-zinc-950/60 backdrop-blur-2xl border border-white/10 min-h-[450px] flex flex-col items-center justify-center py-12 px-6 sm:px-10 md:px-16 rounded-xl transition-all duration-500">
                                    <div className="flex flex-col items-center gap-2 mb-2">
                                        <span className="text-orange-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] mb-1 drop-shadow-sm">Official Event Pass</span>
                                        <h1 className='text-3xl sm:text-4xl lg:text-5xl font-black text-white text-center px-4 leading-tight tracking-tighter'>
                                            {eventInfo?.title}
                                        </h1>
                                    </div>

                                    <div className='flex flex-col gap-8 w-full max-w-2xl border-t border-white/5 pt-10 mt-6'>
                                        {/* Date and Time Row */}
                                        <div className="grid grid-cols-2 gap-8 w-full">
                                            <div className="flex flex-col gap-3 items-center text-center">
                                                <div className="p-3 bg-orange-500/10 rounded-full border border-orange-500/20 shadow-inner">
                                                    <BsFillCalendarDateFill className='text-orange-400' size={22} />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className='text-zinc-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em]'>Date</p>
                                                    <p className='text-white text-base sm:text-xl font-bold'>
                                                        {eventInfo?.date ? new Date(eventInfo.date).toLocaleDateString('en-GB') : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3 items-center text-center">
                                                <div className="p-3 bg-orange-500/10 rounded-full border border-orange-500/20 shadow-inner">
                                                    <FaClock className='text-orange-400' size={22} />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className='text-zinc-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em]'>Time</p>
                                                    <p className='text-white text-base sm:text-xl font-bold'>{eventInfo?.time}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Venue Row (Focused) */}
                                        <div className="flex flex-col gap-3 items-center text-center w-full bg-white/5 py-6 px-4 rounded-2xl border border-white/[0.03] backdrop-blur-sm">
                                            <div className="p-3 bg-orange-500/10 rounded-full border border-orange-500/20">
                                                <MdStadium className='text-orange-400' size={28} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className='text-zinc-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]'>Venue</p>
                                                <p className='text-white text-lg sm:text-2xl font-black tracking-tight'>{eventInfo?.venue}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* <section className='flex items-center flex-col md:flex-row w-full gap-2 justify-center text-center'>
                                {tickets.length < 5 ? ticketSummary?.map((summary: any, index) => (
                                    <div
                                        key={index}
                                        className='text-center bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 w-full p-2 px-3 lg:max-w-fit rounded cursor-pointer hover:bg-zinc-800 duration-100'>
                                        <h4 className='text-zinc-400'>{summary.name}</h4>
                                        <span className='text-2xl text-zinc-200'>{summary.value}</span>
                                    </div>
                                )) : null}
                            </section> */}

                            <section className="mt-6">
                                <TicketCarousel tickets={tickets} user={user} eventInfo={eventInfo} />
                            </section>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <h2 className="text-2xl text-zinc-600">No Tickets Found</h2>
                            <p className="text-zinc-500 mt-2">Unable to display tickets for this event.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20">
                    <h2 className="text-2xl text-zinc-600">No Tickets Found</h2>
                    <p className="text-zinc-500 mt-2">You haven't purchased any tickets for this event.</p>
                </div>
            )}
        </>
    )
}
