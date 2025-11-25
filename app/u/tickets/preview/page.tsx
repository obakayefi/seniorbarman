"use client"
import Image from "next/image";
import {MdStadium} from "react-icons/md";
import {FaClock} from "react-icons/fa6";
import {BsFillCalendarDateFill} from "react-icons/bs";
import React, {useEffect, useState} from "react";
import NButton from "@/components/native/NButton";
import {Delete, ShieldCheckIcon} from "lucide-react";
import {useApp} from "@/context/AppContext";
import {useParams} from "next/navigation";
import api from "@/lib/axios";
import {Spinner} from "@/components/ui/spinner";
import {formatEvent} from "@/lib/utils";

export default function PreviewTickets() {
    const [currentTicket, setCurrentTicket] = useState<null | undefined>(undefined);
    const {user} = useApp()
    const params = useParams()

    const fetchTicketDetails = async () => {
        try {
            const token = params.hashToken
            const {data} = await api.get(`/tickets/preview/${token}`);
            const eventFormatted = formatEvent(data.event)
            // console.log({data, eventFormatted})
            setCurrentTicket({...data, awayLogo: eventFormatted.awayLogo, homeLogo: eventFormatted.homeLogo})
        } catch (e) {
            console.log({e})
        }
    }

    useEffect(() => {
        console.log({user})
    }, [user]);

    useEffect(() => {
        fetchTicketDetails()
    }, [])

    return (
        <div className={'flex flex-col gap-10 mx-4 mt-4'}>
            {currentTicket?.ticket ? (
                <div className='bg-slate-100/20 border-1 rounded justify-center flex flex-col items-center py-6'>
                    <section className='flex items-center gap-10'>
                        <div className='flex md:flex-row flex-col-reverse gap-2 items-center'>
                            <h2 className="text-base md:text-xl">{currentTicket?.event?.homeTeam}</h2>
                            <Image src={currentTicket.homeLogo} loading={'eager'} alt='logo' height={100} width={50}
                                   className={'w-12 md:w-24'}/>
                        </div>
                        <span className='text-xl text-orange-400'>vs</span>
                        <div className='flex md:flex-row flex-col gap-2 items-center'>
                            <Image src={currentTicket.awayLogo} loading={'eager'} alt='logo' height={100} width={50}
                                   className={'w-12 md:w-24'}/>
                            <h2 className="text-base md:text-xl">{currentTicket?.event?.awayTeam}</h2>
                        </div>
                    </section>

                    <section className='flex md:flex-row flex-col items-center gap-10 mr-0 md:mr-10 mt-15 '>
                        <div className="flex-col flex gap items-center">
                            <MdStadium className='text-slate-400' size={22}/>
                            <p className='hidden md:block text-slate-500'>Venue</p>
                            <p className='text-orange-400'>{currentTicket?.event?.venue}</p>
                        </div>
                        <div className="flex-col flex gap items-center">
                            <FaClock className='text-slate-400'/>
                            <p className='hidden md:block text-slate-500'>Time</p>
                            <p className='text-orange-400'>{currentTicket?.event?.time}</p>
                        </div>
                        <div className="flex-col flex justitfy-center gap items-center">
                            <BsFillCalendarDateFill className='text-slate-400'/>
                            <p className='hidden md:block text-slate-500'>Date</p>
                            <p className='text-orange-400'>{new Date(currentTicket?.event?.date).toDateString()}</p>
                        </div>
                    </section>
                </div>
            ) : (
                <div className={'flex items-center gap-2'}> <span>Loading Ticket</span> <Spinner /></div>
            )}

            {user?.role === "admin" ? (
                <div className={'bg-slate-100/20 border-1 rounded p-4 text-slate-700'}>
                    <h2 className={'text-slate-400 text-xl'}>Admin Actions</h2>

                    <section>
                        <section className='flex gap-2 border-slate-200 pt-4'>
                            <NButton
                                loading={false}
                                disabled={false}
                                onClick={() => {
                                }}
                                icon={<ShieldCheckIcon/>}
                                className='cursor-pointer font-light active:translate-x-2 border-2 border-transparent duration-50 bg-orange-500'>
                                Check User In
                            </NButton>

                            <NButton
                                loading={false}
                                disabled={false}
                                onClick={() => {
                                }}
                                icon={<Delete/>}
                                className='cursor-pointer font-light active:translate-x-2 hover:text-white p-2 duration-50 bg-white text-orange-500 border-2 border-slate-200'>
                                Block Ticket
                            </NButton>
                        </section>
                    </section>
                </div>
            ) : user?.role === "bouncer" ? (
                <div className={'bg-slate-100/20 border-1 rounded p-4 text-slate-700'}>
                    <h2 className={'text-slate-400 text-xl'}>Admin Actions</h2>

                    <section>
                        <section className='flex gap-2 border-slate-200 pt-4'>
                            <NButton
                                loading={false}
                                disabled={false}
                                onClick={() => {
                                }}
                                icon={<ShieldCheckIcon/>}
                                className='cursor-pointer font-light active:translate-x-2 border-2 border-transparent duration-50 bg-orange-500'>
                                Check User In
                            </NButton>

                            <NButton
                                loading={false}
                                disabled={false}
                                onClick={() => {
                                }}
                                icon={<Delete/>}
                                className='cursor-pointer font-light active:translate-x-2 hover:text-white p-2 duration-50 bg-white text-orange-500 border-2 border-slate-200'>
                                Block Ticket
                            </NButton>
                        </section>
                    </section>
                </div>
            ) : null}
        </div>
    )
}