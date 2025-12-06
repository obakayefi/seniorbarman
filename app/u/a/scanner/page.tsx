"use client"
import React, {useEffect, useState} from 'react'
import {useQRCode} from 'next-qrcode'
import {Switch} from "@/components/ui/switch"
import {MdSecurity, MdStadium} from "react-icons/md";
import {Scanner} from '@yudiel/react-qr-scanner';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import api from '@/lib/axios';
import {Delete, Power, QrCode, ShieldCheck, ShieldCheckIcon, User2Icon, UserIcon} from 'lucide-react';
import {Button} from '@/components/ui/button';
import NButton from '@/components/native/NButton';
import {TbSoccerField} from "react-icons/tb";
import {toast} from 'sonner';
import {RiVerifiedBadgeFill} from "react-icons/ri";
import {MdReport} from "react-icons/md";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {fetchEventStats, getUpcomingEvents} from "@/services/actions";
import {Spinner} from "@/components/ui/spinner";
import {STATUS_TEXT} from "@/lib/utils"
import {IEventStats} from "@/types/data";
import {extractTicketStatus} from "@/lib/utils";

type TicketSummary = {
    event: {
        homeTeam: string;
        awayTeam: string;
    };
    user: string;
    ticket: {
        status: string;
        id: string;
        stand: string;
    }
}


type PreCheckInActionsProps = {
    loading: boolean;
    handleCheckingUserIn: () => void;
    eventMismatch: boolean;
}

const PreCheckInActions = ({loading, handleCheckingUserIn, eventMismatch}: PreCheckInActionsProps) => {
    if (eventMismatch) return null

    return (
        <section className='border-t-1 flex justify-between gap-2 border-slate-200 pt-4'>
            <NButton
                loading={loading}
                disabled={loading}
                onClick={handleCheckingUserIn}
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
                className='cursor-pointer font-light active:translate-x-2 border-2 border-transparent duration-50 bg-orange-500'>
                Block Ticket
            </NButton>
        </section>
    )
}


type PostCheckInActionsProps = {
    loading: boolean;
    handleBlockingTicket: () => void;
    handleCheckingUserOut: () => void;
    eventMismatch: boolean;
}

const PostCheckInActions = ({
                                loading,
                                eventMismatch,
                                handleCheckingUserOut,
                                handleBlockingTicket
                            }: PostCheckInActionsProps) => {

    if (eventMismatch) return null

    return (
        <section className='border-t-1 flex justify-between gap-2 border-slate-200 pt-4'>
            <NButton
                loading={loading}
                disabled={loading}
                onClick={handleCheckingUserOut}
                icon={<ShieldCheckIcon/>}
                className='cursor-pointer font-light active:translate-x-2 border-2 border-transparent duration-50 bg-red-500'>
                Check User Out
            </NButton>

            <NButton
                loading={loading}
                disabled={loading}
                onClick={handleBlockingTicket}
                icon={<Delete/>}
                className='cursor-pointer font-light active:translate-x-2 border-2 border-transparent duration-50 bg-white text-red-500'>
                Block Ticket
            </NButton>
        </section>
    )
}


const AdminTicketScanner = () => {
    const {SVG} = useQRCode()
    const [openApprovalModal, setOpenApprovalModal] = useState(false)
    const [currentTicket, setCurrentTicket] = useState<TicketSummary>({} as TicketSummary)
    const [targetHash, setTargetHash] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [loadingTickets, setLoadingTickets] = useState([])
    const [ticketStatus, setTicketStatus] = useState('')
    const [isCheckingUserOut, setIsCheckingUserOut] = useState(false)
    const [isBlockingTicket, setIsBlockingTicket] = useState(false)
    const [canScan, setCanScan] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState('')
    const [computedStatus, setComputedStatus] = useState('')
    const [monitorMode, setMonitorMode] = useState<boolean>(false)
    const [events, setEvents] = useState<[]>([])
    const [eventStats, setEventStats] = useState<IEventStats>({} as IEventStats)
    // const [totalInStadium]

    const toggleMonitorMode = () => setMonitorMode(!monitorMode)

    const toggleScanMode = () => setCanScan(scan => !scan)


    const statusBadgeStyle = () => {
        switch (computedStatus) {
            case STATUS_TEXT[0]:
                return "bg-green-200 text-green-600"
            case STATUS_TEXT[1]:
                return "bg-red-200 text-red-600"
            case STATUS_TEXT[2]:
                return "bg-orange-200 text-orange-600"
            default:
                return "bg-slate-200 text-slate-600"
        }
    }

    useEffect(() => {
        async function loadEvents() {
            setLoading(true)
            const _events = (await getUpcomingEvents()).data
            if (_events && _events.events.length) setEvents(_events.events)
            setLoading(false)
        }

        loadEvents()
    }, [])

    // useEffect(() => {
    //     // console.log({eventsLogged: events})
    // }, [events]);


    const handleScan = async (detectedCodes: any) => {
        const qrValue = (detectedCodes[0].rawValue).split('/')
        const ticketHash = qrValue[qrValue.length - 2]
        const {data} = await api.get(`/admin/scanner?hash=${ticketHash}`)
        const ticket = data.result.ticket
        const user = data.result.createdBy
        const ticketData = {
            ...ticket,
            createdBy: user
        }
        setCurrentTicket(ticketData)
        setTargetHash(ticketHash)
        setTicketStatus(data.result.ticket.status)
        setComputedStatus(extractTicketStatus(data.result.ticket.checkInLogs))
        setOpenApprovalModal(true)
        setCanScan(false)
    };

    useEffect(() => {
        setComputedStatus(extractTicketStatus(currentTicket.checkInLogs))
        console.log({computedStatus})
        console.log({currentTicket})
    }, [currentTicket]);

    useEffect(() => {
        console.log({events})
    }, [events]);
    
    useEffect(() => {
        if (!selectedEvent) return
        const getEventStats = async () => {
            const stats = await fetchEventStats(selectedEvent)
            console.log({stats})
            setEventStats(stats.eventTicketStats)
        }
        getEventStats()
    }, [selectedEvent]);

    useEffect(() => {
        console.log({eventStatsChange: eventStats})
    }, [eventStats]);

    const handleCheckingUserOut = async () => {
        setIsCheckingUserOut(true)
        const {data} = await api.post(`/tickets/${targetHash}/check-ticket-out`)
        console.log({data})
        setComputedStatus(extractTicketStatus(data.result.ticket.checkInLogs))
        setIsCheckingUserOut(false)
    }

    const handleBlockingTicket = async () => {
        setIsBlockingTicket(true)
        const blockedTicket = await api.post(`/tickets/${targetHash}/block-ticket`)
        console.log('Blocking Ticket', {blockedTicket})
        setIsBlockingTicket(false)
    }
    const handleCheckingUserIn = async () => {
        setLoading(true)
        const {data} = await api.post(`/tickets/${targetHash}/check-ticket-in`)
        console.log({ data, ticket: data.result.ticket})
        setComputedStatus(extractTicketStatus(data.result.ticket.checkInLogs))
        //setCurrentTicket(data.ticket)
        setLoading(false)
    }


    return (
        <div className='p-15 h-screen overflow-y-auto'>
            <h2 className='text-4xl flex text-orange-400 items-center gap-2'>
                <span>Ticket Scanner</span> <span><QrCode className='text-orange-400 mt-0.5'/></span>
            </h2>
            <div className="flex lg:flex-row flex-col-reverse gap-2">
                <section className='w-4/4'>
                    <div className="flex lg:flex-row flex-col gap-1 w-full">
                        {selectedEvent ? (
                            <section className="flex mt-2 lg:mt-10 w-1/2 mb-4 flex-col">
                                <h2 className="text-xl mb-4 text-slate-600">Monitoring Mode</h2>
                                <div className="bg-amber-100 gap-2 h-full flex pl-2 p-2 px-6 rounded items-center max-w-fit lg:w-full">
                                    <Switch checked={monitorMode} onCheckedChange={toggleMonitorMode}/>
                                    <span className={'text-amber-500'}>{monitorMode ? "Activated" : "Deactivated"}</span>
                                </div>
                            </section>
                        ) : null}
                        
                        <section className="flex mt-2 lg:mt-10 mb-4 w-full flex-col">
                            <h2 className="text-xl mb-4 text-slate-600">Pick Event To Monitor</h2>
                            <div className="bg-gray-200 rounded w-full">
                                {events.length > 0 ? (
                                    <Select
                                        value={selectedEvent}
                                        onValueChange={(value: string) => {
                                            setSelectedEvent(value);
                                        }}
                                    >
                                        <SelectTrigger className="w-full grow-0 flex">
                                            <SelectValue placeholder="Pick an event to scan for"/>
                                        </SelectTrigger>
                                        <SelectContent className={'w-full'}>
                                            {events.map(event => (
                                                <SelectItem key={event._id} value={event._id} className={'w-full outline'}>
                                                    {/*<span className={'text-xs bg-green-400 text-white p-1 rounded'}>(Home)</span> {event.homeTeam} vs {event.awayTeam} <span className={'bg-orange-400 text-white p-1 rounded text-xs'}>(Away)</span> | {new Date(event.date).toDateString()}*/}
                                                    <span
                                                        className={'text-xs bg-green-500 text-white p-1 rounded'}>Home</span> {event.homeTeam} vs {event.awayTeam}
                                                    <span
                                                        className={'bg-orange-400 text-white p-1 rounded text-xs'}>Away</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : loadingTickets ? (
                                    <div className={'flex gap-2 p-1 px-3 items-center'}>
                                        <h3 className={'text-slate-400'}>Loading Events </h3>
                                        <span><Spinner/></span>
                                    </div>
                                ): (
                                    <div>
                                        <h2 className="text-xl">No Events</h2>
                                    </div>
                                )}
                            </div>
                        </section>

                        
                    </div>

                    {/*MOBILE SCANNER */}
                    <div className="h-auto bg-slate-100 md:hidden w-full flex flex-col gap-1">
                        {(monitorMode || !selectedEvent) ? null : (
                            <section>
                                {canScan ? (
                                    <Scanner
                                        onScan={handleScan}
                                        onError={(error: any) => console.log(error?.message)}
                                    />
                                ) : null}
                            </section>
                        )}
                        <NButton className={`${canScan ? 'bg-orange-500' : ''}`} icon={<Power/>}
                                 onClick={toggleScanMode}>{canScan ? 'Turn Scan Off' : 'Activate Scanner'} </NButton>
                    </div>

                    {selectedEvent ? (
                        <div className="flex mt-10 flex-col gap-2 w-full">
                            <h2 className='text-3xl text-slate-600'>Fan Stats</h2>
                            <div className='flex gap-4 flex-col md:flex-row'>
                                <section className="bg-green-100 p-2 rounded lg:w-54">
                                    <h2 className='text-sm text-slate-500'>Tickets Sold</h2>
                                    {/*<span className='text-5xl text-slate-800'>{eventStats.totalPeopleCheckedIn}/{eventStats.totalTicketsBought}</span>*/}
                                    <span className='text-5xl text-slate-800'>
                                        {eventStats.totalTicketsBought}
                                    </span>
                                </section>
                                <section className="bg-green-100 p-2 rounded lg:w-54">
                                    <h2 className='text-sm text-slate-500'>Total Check In</h2>
                                    <span className='text-5xl text-slate-800'>{eventStats.totalPeopleCheckedIn}</span>
                                </section>
                                <section className="bg-blue-100 p-2 rounded lg:w-54">
                                    <h2 className='text-sm text-slate-500'>Inside Stadium</h2>
                                    <span className='text-5xl text-slate-800'>{eventStats.totalPeopleInside}</span>
                                </section>
                                <section className="bg-red-100/50 p-2 rounded lg:w-54">
                                    <h2 className='text-sm text-slate-800'>Outside Stadium</h2>
                                    <span className='text-5xl text-slate-800'>{eventStats.totalPeopleOutside}</span>
                                </section>
                            </div>
                        </div>
                    ) : null}

                    {!selectedEvent ? null : (
                        <div className='mt-10'>
                            <h2 className="text-3xl text-slate-600 mb-2">Recent Scans</h2>
                            <section
                                className='border border-slate-200 h-76 overflow-y-auto flex flex-col items-center justify-center gap-2 p-2'>
                                <MdSecurity size={32} color={'text-orange-300'}/>
                                <h2 className=" text-slate-500">No one has checked in yet</h2>
                            </section>

                            {/*<section className='border border-slate-200 max-h-76 overflow-y-auto flex flex-col gap-4 p-2'>*/}

                            {/*<div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>*/}
                            {/*    <h3>Rangers vs Enyimba</h3>*/}
                            {/*    <p className=''>Popular stand</p>*/}
                            {/*    <p className='text-gray-600'>25 December 2025</p>*/}
                            {/*    <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>*/}
                            {/*</div>*/}

                            {/*<div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>*/}
                            {/*    <h3>Rangers vs Enyimba</h3>*/}
                            {/*    <p className=''>Popular stand</p>*/}
                            {/*    <p className='text-gray-600'>25 December 2025</p>*/}
                            {/*    <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>*/}
                            {/*</div>*/}

                            {/*<div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>*/}
                            {/*    <h3>Rangers vs Enyimba</h3>*/}
                            {/*    <p className=''>Popular stand</p>*/}
                            {/*    <p className='text-gray-600'>25 December 2025</p>*/}
                            {/*    <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>*/}
                            {/*</div>*/}

                            {/*<div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>*/}
                            {/*    <h3>Rangers vs Enyimba</h3>*/}
                            {/*    <p className=''>Popular stand</p>*/}
                            {/*    <p className='text-gray-600'>25 December 2025</p>*/}
                            {/*    <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>*/}
                            {/*</div>*/}

                            {/*<div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>*/}
                            {/*    <h3>Rangers vs Enyimba</h3>*/}
                            {/*    <p className=''>Popular stand</p>*/}
                            {/*    <p className='text-gray-600'>25 December 2025</p>*/}
                            {/*    <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>*/}
                            {/*</div>*/}
                            {/*<div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>*/}
                            {/*    <h3>Rangers vs Enyimba</h3>*/}
                            {/*    <p className=''>Popular stand</p>*/}
                            {/*    <p className='text-gray-600'>25 December 2025</p>*/}
                            {/*    <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>*/}
                            {/*</div>*/}
                            {/*<div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>*/}
                            {/*    <h3>Rangers vs Enyimba</h3>*/}
                            {/*    <p className=''>Popular stand</p>*/}
                            {/*    <p className='text-gray-600'>25 December 2025</p>*/}
                            {/*    <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>*/}
                            {/*</div>*/}
                            {/*<div className='flex gap-2 items-center justify-between bg-gray-100/50 p-4 rounded'>*/}
                            {/*    <h3>Rangers vs Enyimba</h3>*/}
                            {/*    <p className=''>Popular stand</p>*/}
                            {/*    <p className='text-gray-600'>25 December 2025</p>*/}
                            {/*    <p className='bg-slate-800 text-slate-300 px-6 p-0.5 rounded-full'>14:00</p>*/}
                            {/*</div>*/}
                            {/*</section>*/}
                        </div>
                    )}

                </section>


                {(monitorMode || !selectedEvent) ? null : (
                    <section
                        className='md:border-2 bg-transparent md:bg-slate-100 rounded p-8 flex items-center justify-center overflow-hidden h-auto md:border-slate-200 w-full'>
                        {/* DESKTOP SCANNER */}
                        <div className="h-auto w-96 hidden md:flex flex-col gap-1">
                            <section>
                                {canScan ? (
                                    <Scanner
                                        onScan={handleScan}
                                        onError={(error: any) => console.log(error?.message)}
                                    />
                                ) : null}

                            </section>
                            <NButton className={`${canScan ? 'bg-orange-500' : ''}`} icon={<Power/>}
                                     onClick={toggleScanMode}>{canScan ? 'Turn Scan Off' : 'Activate Scanner'} </NButton>
                        </div>
                        <Dialog open={openApprovalModal} onOpenChange={setOpenApprovalModal}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Ticket Information</DialogTitle>
                                </DialogHeader>
                                <DialogDescription className='flex flex-col gap-2 justify-between'>
                                    {(selectedEvent && currentTicket) && selectedEvent === currentTicket.event?._id ? (
                                        <section className={'flex items-center gap-1 text-green-500'}>
                                            <h4>Valid </h4>
                                            <span><RiVerifiedBadgeFill size={24} className={'mb-0.5'}/></span>
                                        </section>
                                    ) : (
                                        <section className={'flex items-center gap-1 text-red-500'}>
                                            <h4>Event Mismatch </h4>
                                            <span><MdReport size={24}/></span>
                                        </section>
                                    )}

                                    <div className='flex flex-col items-start gap-1'>
                                        {/*<h4>Status</h4>*/}
                                        <h4 className={`${statusBadgeStyle()} p-1 px-2 rounded `}>{computedStatus ?? "Ah!"}</h4>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <h2 className='text-lg text-slate-800'>{currentTicket.event?.homeTeam}</h2>
                                        <span>vs</span>
                                        <h2 className='text-lg text-slate-800'>{currentTicket.event?.awayTeam}</h2>
                                    </div>

                                </DialogDescription>
                                <section className='flex items-center w-full justify-between'>
                                    <div className={'flex items-center text-slate-600 gap-1'}>
                                        <h5 className='text-sm text-slate-600'>{currentTicket.stand}</h5>
                                        <span>
                                            <MdStadium size={21}/>
                                        </span>

                                    </div>

                                    <div
                                        className='text-slate-300 px-2 py-1 rounded text-sm flex items-center justify-center gap-1 bg-slate-800 w-max-fit'>
                                        <span
                                            className='flex items-center gap-1'>{`${currentTicket?.createdBy?.firstName}`}</span>
                                        <span
                                            className='mb-0.5'><User2Icon size={16}/></span>
                                    </div>
                                </section>


                                {/* ACTIONS */}
                                {
                                    computedStatus === "Checked In" ?
                                        <PostCheckInActions
                                            eventMismatch={(selectedEvent !== currentTicket.event?._id)}
                                            handleCheckingUserOut={handleCheckingUserOut}
                                            handleBlockingTicket={handleBlockingTicket}
                                            loading={isCheckingUserOut}
                                        />
                                        : <PreCheckInActions
                                            handleCheckingUserIn={handleCheckingUserIn}
                                            eventMismatch={(selectedEvent !== currentTicket.event?._id)}
                                            loading={loading}
                                        />
                                }
                            </DialogContent>
                        </Dialog>
                    </section>
                )}
            </div>
        </div>
    )
}

export default AdminTicketScanner