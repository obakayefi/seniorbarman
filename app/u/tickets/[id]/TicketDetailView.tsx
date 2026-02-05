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

export default function TicketDetailView() {
    const [tickets, setTickets] = useState([])
    const [eventInfo, setEventInfo] = useState<any>({})
    const [ticketSummary, setTicketSummary] = useState<{}[]>([])
    const params = useParams()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function getTickets() {
            const { data } = await api.get(`/tickets/${params.id}`)
            setEventInfo(data.response.event)
            setTickets(data.response.tickets.tickets)
            setTicketSummary(data.response.summary)
            setLoading(false)
        }
        getTickets()
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
                        <>
                            <div className='bg-zinc-950/90 border-zinc-800 border-1 rounded justify-center flex flex-col items-center mb-4 py-6'>
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

                            <section className='flex items-center flex-col md:flex-row w-full gap-2 justify-center text-center'>
                                {tickets.length < 5 ? ticketSummary?.map((summary: any, index) => (
                                    <div
                                        key={index}
                                        className='text-center bg-zinc-800 w-full p-2 px-3 lg:max-w-fit rounded cursor-pointer hover:bg-zinc-700 duration-100'>
                                        <h4 className='text-zinc-400'>{summary.name}</h4>
                                        <span className='text-2xl text-zinc-200'>{summary.value}</span>
                                    </div>
                                )) : null}
                            </section>

                            <section className="mt-6">
                                <TicketCarousel tickets={tickets} eventInfo={eventInfo} />
                            </section>
                        </>
                    ) : eventInfo?.type === 'event' ? (
                        <>
                            {/* Event View with poster background */}
                            <div
                                className='relative border-zinc-800 border-1 rounded-xl overflow-hidden min-h-[400px]'
                                style={{
                                    backgroundImage: `url(${eventInfo.image || 'https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024'})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-900/70 to-zinc-900/50" />

                                {/* Glassmorphic Card covering entire jumbotron */}
                                <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-md border border-white/10">
                                    <div className="relative z-10 flex flex-col items-center justify-center gap-4 sm:gap-6 p-4 sm:p-6 md:p-8 h-full">
                                        <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center px-4'>{eventInfo?.title}</h1>

                                        <section className='bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6 w-full max-w-2xl'>
                                            <div className='flex flex-col md:flex-row gap-6 sm:gap-10 justify-center'>
                                                <div className="flex-col flex gap items-center">
                                                    <MdStadium className='text-orange-400' size={32} />
                                                    <p className='text-zinc-400'>Venue</p>
                                                    <p className='text-orange-300'>{eventInfo?.venue}</p>
                                                </div>
                                                <div className="flex-col flex gap items-center">
                                                    <FaClock className='text-orange-400' size={28} />
                                                    <p className='text-zinc-400'>Time</p>
                                                    <p className='text-orange-300'>{eventInfo?.time}</p>
                                                </div>
                                                <div className="flex-col flex gap items-center">
                                                    <BsFillCalendarDateFill className='text-orange-400' size={28} />
                                                    <p className='text-zinc-400'>Date</p>
                                                    <p className='text-orange-300'>{new Date(eventInfo?.date).toDateString()}</p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>

                            <section className='flex items-center flex-col md:flex-row w-full gap-2 justify-center text-center'>
                                {tickets.length < 5 ? ticketSummary?.map((summary: any, index) => (
                                    <div
                                        key={index}
                                        className='text-center bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 w-full p-2 px-3 lg:max-w-fit rounded cursor-pointer hover:bg-zinc-800 duration-100'>
                                        <h4 className='text-zinc-400'>{summary.name}</h4>
                                        <span className='text-2xl text-zinc-200'>{summary.value}</span>
                                    </div>
                                )) : null}
                            </section>

                            <section className="mt-6">
                                <TicketCarousel tickets={tickets} eventInfo={eventInfo} />
                            </section>
                        </>
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
