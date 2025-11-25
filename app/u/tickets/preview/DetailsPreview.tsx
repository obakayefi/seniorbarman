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
    const params = useParams()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function getTickets() {
            const data = await api.get(`/tickets/${params.id}`)
            //console.log({params, data: data.data})
            setEventInfo(data.data.response.event)
            setTickets(data.data.response.tickets)
            setLoading(false)
        }

        getTickets()
    }, [])

    useEffect(() => {
        console.log({eventInfo})
    }, [eventInfo]);

    return (
        <>
            <div className='bg-slate-100/20 border-1 rounded justify-center flex flex-col items-center py-6'>
                <section className='flex items-center gap-10'>
                    <div className='flex gap-2 items-center'>
                        <h2 className="text-xl">{eventInfo?.homeTeam}</h2>
                        <Image src={giveLogo(eventInfo?.homeTeam)} alt='logo' height={100} width={150}/>
                    </div>
                    <span className='text-xl text-orange-400'>vs</span>
                    <div className='flex gap-2 items-center'>
                        <Image src={giveLogo(eventInfo?.awayTeam)} alt='logo' height={100} width={125}/>
                        <h2 className="text-xl">{eventInfo?.awayTeam}</h2>
                    </div>
                </section>

                <section className='flex items-center gap-10 mr-10 mt-15 '>
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

            <section className='flex items-center gap-2 justify-center text-center'>
                <div
                    className='text-center bg-slate-100 p-2 px-3 rounded cursor-pointer hover:bg-slate-200 duration-100'>
                    <h4 className='text-slate-400'>Popular Stands</h4>
                    <span className='text-2xl text-slate-600'>3</span>
                </div>
                <div
                    className='text-center bg-slate-100 p-2 px-3 rounded cursor-pointer hover:bg-slate-200 duration-100'>
                    <h4 className='text-slate-400'>Regular Stands</h4>
                    <span className='text-2xl text-slate-600'>12</span>
                </div>
                <div
                    className='text-center bg-slate-100 p-2 px-3 rounded cursor-pointer hover:bg-slate-200 duration-100'>
                    <h4 className='text-slate-400'>Executive Stands</h4>
                    <span className='text-2xl text-slate-600'>2</span>
                </div>
            </section>

            <div className='mt-4 flex mt-10 flex-wrap justify-center gap-4'>
                {tickets?.map((ticket: any) => (
                    <Ticket ticket={ticket} key={ticket._id}/>
                ))}
            </div>
        </>
    )
}