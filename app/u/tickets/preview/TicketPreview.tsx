"use client"

import React, {useEffect, useState} from "react";
import api from "@/lib/axios";
import {useParams, useSearchParams} from "next/navigation";
import Image from "next/image";
import {MdStadium} from "react-icons/md";
import {FaClock} from "react-icons/fa6";
import {BsFillCalendarDateFill} from "react-icons/bs";
import Ticket from "@/app/u/tickets/Ticket";

export default function TicketPreview() {
    const [tickets, setTickets] = useState([])
    const params = useParams()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function getTickets() {
            const data = await api(`/tickets/${params.id}`)
            console.log({tickets_are: data.data, params})
            setTickets(data.data.tickets)
            setLoading(false)
        }
        getTickets()
    }, [])

    return (
        <>
            <div className='bg-slate-100/20 border-1 rounded justify-center flex flex-col items-center py-6'>
                <section className='flex items-center gap-10'>
                    <div className='flex gap-2 items-center'>
                        <h2 className="text-xl">Rangers FC</h2>
                        <Image src={"/clubs/rangers-logo.png"} alt='logo' height={100} width={150}/>
                    </div>
                    <span className='text-xl text-orange-400'>vs</span>
                    <div className='flex gap-2 items-center'>
                        <Image src={"/clubs/awka.png"} alt='logo' height={100} width={125}/>
                        <h2 className="text-xl">Enyimba FC</h2>
                    </div>
                </section>

                <section className='flex items-center gap-10 mr-10 mt-15 '>
                    <div className="flex-col flex gap items-center">
                        <MdStadium className='text-slate-400' size={22}/>
                        <p className='text-slate-500'>Venue</p>
                        <p className='text-orange-400'>Nnamdi Azikiwe Stadium</p>
                    </div>
                    <div className="flex-col flex gap items-center">
                        <FaClock className='text-slate-400'/>
                        <p className='text-slate-500'>Time</p>
                        <p className='text-orange-400'>4:00pm</p>
                    </div>
                    <div className="flex-col flex gap items-center">
                        <BsFillCalendarDateFill className='text-slate-400'/>
                        <p className='text-slate-500'>Date</p>
                        <p className='text-orange-400'>21 January 2026</p>
                    </div>
                </section>
            </div>
            
            {/*<section className='flex items-center gap-2 justify-center text-center'>*/}
            {/*    <div*/}
            {/*        className='text-center bg-slate-100 p-2 px-3 rounded cursor-pointer hover:bg-slate-200 duration-100'>*/}
            {/*        <h4 className='text-slate-400'>Popular Stands</h4>*/}
            {/*        <span className='text-2xl text-slate-600'>3</span>*/}
            {/*    </div>*/}
            {/*    <div*/}
            {/*        className='text-center bg-slate-100 p-2 px-3 rounded cursor-pointer hover:bg-slate-200 duration-100'>*/}
            {/*        <h4 className='text-slate-400'>Regular Stands</h4>*/}
            {/*        <span className='text-2xl text-slate-600'>12</span>*/}
            {/*    </div>*/}
            {/*    <div*/}
            {/*        className='text-center bg-slate-100 p-2 px-3 rounded cursor-pointer hover:bg-slate-200 duration-100'>*/}
            {/*        <h4 className='text-slate-400'>Executive Stands</h4>*/}
            {/*        <span className='text-2xl text-slate-600'>2</span>*/}
            {/*    </div>*/}
            {/*</section>*/}

            <div className='mt-4 flex mt-10 flex-wrap justify-between gap-4'>
                {tickets?.map((ticket: any) => (
                    <Ticket ticket={ticket} key={ticket._id}/>
                ))}
            </div>
        </>
    )
}