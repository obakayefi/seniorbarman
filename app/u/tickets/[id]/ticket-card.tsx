"use client"
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { toPng } from "html-to-image";
import Link from "next/link";
import { MoveLeft } from "lucide-react";
import Image from "next/image";
import { CLUBS, extractTicketStatus, formatTime, giveLogo } from "@/lib/utils";
import { MdStadium } from "react-icons/md";
import { FaClock } from "react-icons/fa6";
import { BsFillCalendarDateFill } from "react-icons/bs";
import NButton from "@/components/native/NButton";
import MatchTicket from "@/components/ui/match-ticket";
import BulkTicketView from "@/app/u/tickets/BulkTicketView";
import RegularTicketView from "@/app/u/tickets/RegularTicketView";

export default function TicketCard() {
    const [tickets, setTickets] = useState([])
    const [eventInfo, setEventInfo] = useState({})
    const [ticketSummary, setTicketSummary] = useState<{}[]>([])
    const params = useParams()
    const [loading, setLoading] = useState(true)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function getTickets() {
            const { data } = await api.get(`/tickets/${params.id}`)
            setEventInfo(data.response.event)
            setTickets(data.response.tickets.tickets)
            setTicketSummary(data.response.summary)
            setLoading(false)
        }
        getTickets()
    }, [])

    const downloadPng = async () => {
        if (!ref.current) return;
        const dataUrl = await toPng(ref.current)
        const link = document.createElement("a");
        link.download = "ticket.png"
        link.href = dataUrl
        link.click()
    }

    useEffect(() => {
        console.log({ tickets })
    }, [tickets]);

    return (
        <>
            {loading ? (
                <div>
                    <h2>Getting Ticket Details...</h2>
                </div>
            ) : tickets.length ? (
                <div>
                    <Link href={'/u/tickets'} className={'text-orange-300 flex items-center mb-3 gap-2'}>
                        <MoveLeft />
                        <span className={'text-orange-500'}>Back to Tickets</span>
                    </Link>
                    <div className='bg-zinc-950/90 border-zinc-800 border-1 rounded justify-center flex flex-col items-center mb-4 py-4 md:py-6 px-2 md:px-4'>
                        <section className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-10'>
                            <div className='flex md:flex-row flex-col-reverse text-center gap-2 items-center'>
                                <h2 className="text-xs sm:text-sm lg:text-xl font-medium sm:font-normal">{eventInfo?.homeTeam}</h2>
                                <Image className={'w-10 sm:w-12 md:w-24'} src={giveLogo(eventInfo?.homeTeam)} alt='logo'
                                    height={100}
                                    width={150} />
                            </div>
                            <span
                                className='text-base sm:text-xl text-orange-400 bg-zinc-900 p-1.5 sm:p-2 h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full'>vs</span>
                            <div className='flex md:flex-row flex-col text-center gap-2 items-center'>
                                <Image className={'w-10 sm:w-12 md:w-24'} src={giveLogo(eventInfo?.awayTeam)} alt='logo'
                                    height={100}
                                    width={125} />
                                <h2 className="text-xs sm:text-sm lg:text-xl font-medium sm:font-normal">{eventInfo?.awayTeam}</h2>
                            </div>
                        </section>

                        <section className='grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 md:gap-10 mt-8 md:mt-15 w-full md:w-auto px-4'>
                            <div className="flex-col flex gap-0.5 items-center">
                                <MdStadium className='text-slate-400' size={18} />
                                <p className='text-[10px] sm:text-xs text-slate-500 uppercase tracking-tight'>Venue</p>
                                <p className='text-xs sm:text-sm md:text-base text-orange-400 font-medium text-center'>{eventInfo?.venue}</p>
                            </div>
                            <div className="flex-col flex gap-0.5 items-center">
                                <FaClock className='text-slate-400' size={16} />
                                <p className='text-[10px] sm:text-xs text-slate-500 uppercase tracking-tight'>Time</p>
                                <p className='text-xs sm:text-sm md:text-base text-orange-400 font-medium'>{formatTime(eventInfo?.time)}</p>
                            </div>
                            <div className="flex-col flex gap-0.5 items-center col-span-2 md:col-span-1">
                                <BsFillCalendarDateFill className='text-slate-400' size={16} />
                                <p className='text-[10px] sm:text-xs text-slate-500 uppercase tracking-tight'>Date</p>
                                <p className='text-xs sm:text-sm md:text-base text-orange-400 font-medium'>{new Date(eventInfo?.date).toDateString()}</p>
                            </div>
                        </section>
                    </div>

                    <section className='flex items-center flex-wrap w-full gap-2 justify-center text-center px-2'>
                        {tickets.length < 5 ? ticketSummary?.map((summary, index) => (
                            <div
                                key={index}
                                className='text-center bg-zinc-800 flex-1 md:flex-none min-w-[120px] p-2 px-3 lg:max-w-fit rounded cursor-pointer hover:bg-zinc-700 duration-100 border border-zinc-700/50'>
                                <h4 className='text-zinc-400 text-[10px] sm:text-xs uppercase tracking-wide'>{summary.name}</h4>
                                <span className='text-lg sm:text-2xl text-zinc-200 font-bold'>{summary.value}</span>
                            </div>
                        )) : null}
                    </section>

                    <section className="flex flex-col flex-wrap md:flex-row xl:grid grid-cols-4 lg:grid-cols-4 md:justify-between gap-4 mt-4">
                        {loading ? (<div>Loading events...</div>) : tickets.length && tickets.length > 4 ? <BulkTicketView id={params.id} tickets={tickets} /> : <RegularTicketView tickets={tickets} />}
                    </section>

                    {/*<div className={'flex items-center justify-center py-2'}>*/}
                    {/*    <Link href={`/u/tickets/${params.id}/print-tickets`}>*/}
                    {/*        <NButton onClick={downloadPng}>Print Tickets</NButton>*/}
                    {/*    </Link>*/}
                    {/*</div>*/}

                    {/*<div ref={ref} className='flex mt-10 flex-wrap justify-center gap-4'>*/}
                    {/*    {tickets?.map((ticket: any) => (*/}
                    {/*        <Ticket ticket={ticket} key={ticket._id}/>*/}
                    {/*    ))}*/}
                    {/*</div>*/}
                </div>
            ) : null}
        </>
    )
}