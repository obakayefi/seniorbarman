"use client"

import React, {useEffect, useState} from "react";
import api from "@/lib/axios";
import {useParams, useSearchParams} from "next/navigation";
import Image from "next/image";
import {MdStadium} from "react-icons/md";
import {FaClock} from "react-icons/fa6";
import {BsFillCalendarDateFill} from "react-icons/bs";
import Ticket from "@/app/u/tickets/Ticket";
import {giveLogo} from "@/lib/utils";

export default function DetailsPreview() {
    const [tickets, setTickets] = useState([])
    const [eventInfo, setEventInfo] = useState({})
    const [ticketSummary, setTicketSummary] = useState<{}[]>([])
    const params = useParams()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function getTickets() {
            const {data} = await api.get(`/tickets/${params.id}`)
            setEventInfo(data.response.event)
            setTickets(data.response.tickets.tickets)
            setTicketSummary(data.response.summary)
            setLoading(false)
        }

        getTickets()
    }, [])
    return (
        <>
            <div className='bg-slate-100/20 border-1 rounded justify-center flex flex-col items-center py-6'>
                <section className='flex flex-col sm:flex-row items-center gap-6 md:gap-10 mr-0 md:mr-5'>
                    <div className='flex md:flex-row flex-col-reverse text-center gap-2 items-center'>
                        <h2 className="text-sm lg:text-xl">{eventInfo?.homeTeam}</h2>
                        <Image className={'w-12 md:w-24'} src={giveLogo(eventInfo?.homeTeam)} alt='logo' height={100}
                               width={150}/>
                    </div>
                    <span
                        className='text-xl text-orange-400 bg-slate-100 p-2 h-10 w-10 flex items-center justify-center rounded-full'>vs</span>
                    <div className='flex md:flex-row flex-col text-center gap-2 items-center'>
                        <Image className={'w-12 md:w-24'} src={giveLogo(eventInfo?.awayTeam)} alt='logo' height={100}
                               width={125}/>
                        <h2 className="text-sm lg:text-xl">{eventInfo?.awayTeam}</h2>
                    </div>
                </section>

                <section className='flex flex-col md:flex-row gap-10 mt-15 '>
                    <div className="flex-col flex gap items-center">
                        <MdStadium className='text-slate-400' size={22}/>
                        <p className='text-slate-500'>Venue</p>
                        <p className='text-orange-400'>{eventInfo?.venue}</p>
                    </div>
                    <div className="flex-col flex gap items-center">
                        <FaClock className='text-slate-400'/>
                        <p className='text-slate-500'>Time</p>
                        <p className='text-orange-400'>{eventInfo?.time}</p>
                    </div>
                    <div className="flex-col flex gap items-center">
                        <BsFillCalendarDateFill className='text-slate-400'/>
                        <p className='text-slate-500'>Date</p>
                        <p className='text-orange-400'>{new Date(eventInfo?.date).toDateString()}</p>
                    </div>
                </section>
            </div>

            <section className='flex items-center flex-col md:flex-row w-full gap-2 justify-center text-center'>
                {ticketSummary?.map((summary, index) => (
                    <div
                        key={index}
                        className='text-center bg-slate-100 w-full p-2 px-3 lg:max-w-fit rounded cursor-pointer hover:bg-slate-200 duration-100'>
                        <h4 className='text-slate-400'>{summary.name}</h4>
                        <span className='text-2xl text-slate-600'>{summary.value}</span>
                    </div>
                ))}
            </section>

            <div className='flex mt-10 flex-wrap justify-center gap-4'>
                {tickets?.map((ticket: any) => (
                    <Ticket ticket={ticket} key={ticket._id}/>
                ))}
            </div>
        </>
    )
}