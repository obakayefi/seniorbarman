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
import TicketScanner from "@/components/widgets/TicketScanner";

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

export const PreCheckInActions = ({loading, handleCheckingUserIn, eventMismatch}: PreCheckInActionsProps) => {
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

export const PostCheckInActions = ({
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


export type TicketOperationType = 'check-in' | 'check-out' | 'suspend' | 'scan' | undefined

const AdminTicketScanner = () => {
    const {SVG} = useQRCode()
    // const [canScan, setCanScan] = useState(true)
    const [monitorMode, setMonitorMode] = useState<boolean>(false)
    const [openApprovalModal, setOpenApprovalModal] = useState(false)
    const [currentTicket, setCurrentTicket] = useState<TicketSummary>({} as TicketSummary)
    const [targetHash, setTargetHash] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [loadingTickets, setLoadingTickets] = useState([])
    const [ticketStatus, setTicketStatus] = useState('')
    const [isCheckingUserOut, setIsCheckingUserOut] = useState(false)
    const [isBlockingTicket, setIsBlockingTicket] = useState(false)
    const [canScan, setCanScan] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState('')
    const [computedStatus, setComputedStatus] = useState('')
    const [events, setEvents] = useState<[]>([])
    const [eventStats, setEventStats] = useState<IEventStats>({} as IEventStats)
    const [ticketOperation, setTicketOperation] = useState<'check-in' | 'check-out' | 'suspend' | 'scan' | undefined>(undefined)
    

    const selectTicketOperation = (operation: TicketOperationType) => setTicketOperation(operation)
    
    const resetTicketOperation = () => setTicketOperation(undefined)
    
    useEffect(() => {
        async function loadEvents() {
            setLoadingTickets(true)
            const _events = (await getUpcomingEvents()).data
            if (_events) setEvents(_events.events)
            setLoadingTickets(false)
        }

        loadEvents()
    }, [])

    // useEffect(() => {
    //     // console.log({eventsLogged: events})
    // }, [events]);
    const toggleScanMode = () => setCanScan(scan => !scan)
    const toggleMonitorMode = () => setMonitorMode(!monitorMode)

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
        const stringData = JSON.stringify(ticketData)
        localStorage.setItem('currentTicket', stringData)
        setTargetHash(ticketHash)
        setTicketStatus(data.result.ticket.status)
        setComputedStatus(extractTicketStatus(data.result.ticket.checkInLogs))
        setOpenApprovalModal(true)
        setCanScan(false)
    };

    useEffect(() => {
        setComputedStatus(extractTicketStatus(currentTicket.checkInLogs))
    }, [currentTicket]);
    const getEventStats = async () => {
        const stats = await fetchEventStats(selectedEvent)
        setEventStats(stats.eventTicketStats)
    }

    useEffect(() => {
        if (!selectedEvent) return
        getEventStats()
    }, [selectedEvent]);

    // useEffect(() => {
    //     console.log({eventStatsChange: eventStats})
    // }, [eventStats]);

    const handleCheckingUserOut = async () => {
        setIsCheckingUserOut(true)
        const {data} = await api.post(`/tickets/${targetHash}/check-ticket-out`)
        setComputedStatus(extractTicketStatus(data.result.ticket.checkInLogs))
        // setEventStats(data.result.ticket.eventTicketStats)
        //console.log({statusOut: data.result})
        setEventStats(data.result.eventTicketStats)
        //getEventStats()
        setIsCheckingUserOut(false)
    }

    const handleBlockingTicket = async () => {
        setIsBlockingTicket(true)
        const blockedTicket = await api.post(`/tickets/${targetHash}/block-ticket`)
        //console.log('Blocking Ticket', {blockedTicket})
        setIsBlockingTicket(false)
    }
    const handleCheckingUserIn = async () => {
        setLoading(true)
        const {data} = await api.post(`/tickets/${targetHash}/check-ticket-in`)
        setComputedStatus(extractTicketStatus(data.result.ticket.checkInLogs))

        setEventStats(data.result.eventTicketStats)
        setLoading(false)
    }

    
    const cleanupDialogState = () => {
        console.log('Cleaning up dialog state')
    }
   

    return (
        <div className='p-15 h-screen overflow-y-auto'>
            <h2 className='text-4xl flex text-orange-400 items-center gap-2'>
                <span>Ticket Scanner</span> <span><QrCode className='text-orange-400 mt-0.5'/></span>
            </h2>
            <div className="flex lg:flex-row flex-col-reverse gap-2">
                <section className='w-4/4 mt-1'>
                    <div className="flex lg:flex-row bg-zinc-900 p-2 px-4 rounded-lg gap-4 flex-col items-end w-full">
                        {selectedEvent ? (
                            <section className="flex mt-2 lg:mt-1 max-w-fit mb-4 flex-col">
                                <h2 className="text-lg mb-1 text-zinc-600">Monitoring Mode</h2>
                                <div
                                    className="bg-zinc-800 gap-2 h-full flex pl-2 p-1.5 px-6 rounded items-center max-w-fit lg:w-full">
                                    <Switch className={'text-zinc-500'} checked={monitorMode}
                                            onCheckedChange={toggleMonitorMode}/>
                                    <span
                                        className={'text-zinc-500'}>{monitorMode ? "Activated" : "Deactivated"}</span>
                                </div>
                            </section>
                        ) : null}

                        <section className="flex mt-2 lg:mt-10 mb-4 w-full flex-col">
                            <h2 className="text-lg mb-1 text-zinc-600">Pick Event To Monitor</h2>
                            <div className="bg-zinc-800 rounded w-full">
                                {events.length > 0 ? (
                                    <Select
                                        value={selectedEvent}
                                        onValueChange={(value: string) => {
                                            setSelectedEvent(value);
                                        }}
                                    >
                                        <SelectTrigger
                                            className="w-full grow-0 bg-zinc-800 text-zinc-100 py-1 outline-none border-2 border-zinc-800 flex">
                                            <SelectValue placeholder="Pick an event to scan for"/>
                                        </SelectTrigger>
                                        <SelectContent className={'w-full'}>
                                            {events.map(event => (
                                                <SelectItem
                                                    key={event._id}
                                                    value={event._id}
                                                    className={'w-full outline'}>
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
                                ) : (
                                    <div>
                                        <h2 className="text-xl">No Events</h2>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div>
                            <h2 className='text-lg text-zinc-600'>Total Tickets</h2>
                            <section className="bg-zinc-800 p-1.5 px-2 mb-4 rounded lg:w-54">
                                {/*<span className='text-5xl text-slate-800'>{eventStats.totalPeopleCheckedIn}/{eventStats.totalTicketsBought}</span>*/}
                                <span className='text-xl text-zinc-400'>
                                        {/*{Number(eventStats?.totalTicketsBought)?.toLocaleString()}*/}
                                    340 / 1,200
                                    </span>
                            </section>
                        </div>
                    </div>

                    {/*MOBILE SCANNER */}
                    <div className="h-auto bg-zinc-800 md:hidden w-full flex flex-col gap-1">
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
                            <h2 className='text-3xl text-zinc-400'>Fan Stats</h2>
                            <div className='flex gap-4 flex-col'>

                                <section className="bg-neutral-900 p-2 px-4 flex flex-col gap-4 rounded lg:w-2/2">
                                    {/* stand header */}
                                    <div className={'flex items-center justify-between'}>
                                        <section className={'flex items-center gap-2'}>
                                            <div className="h-3 w-3 rounded-full bg-indigo-800"/>
                                            <h2 className='text-xl text-indigo-200'>Popular Stand</h2>
                                        </section>
                                        <span className={'text-zinc-500'}>2,000 / 2,500</span>
                                    </div>

                                    {/* stand overall progress */}
                                    <div className={'flex items-center justify-between gap-2'}>
                                        <div className={'w-[80%] bg-indigo-800 h-2 rounded-lg'}/>
                                        <div className={'w-[20%] bg-zinc-700 h-2 rounded-lg'}/>
                                    </div>

                                    <div className={'flex items-center justify-between gap-2'}>
                                        <section className={'text-center'}>
                                            <h3 className={'text-zinc-600 text-sm'}>INSIDE</h3>
                                            <p className={'text-2xl text-left text-indigo-200'}>425</p>
                                        </section>
                                        <section className={'text-center'}>
                                            <h3 className={'text-zinc-600 text-sm'}>OUTSIDE</h3>
                                            <p className={'text-2xl text-right text-blue-200'}>239</p>
                                        </section>
                                    </div>

                                    {/*<span className='text-2xl text-zinc-300'>*/}
                                    {/*    {Number(eventStats?.totalTicketsBought)?.toLocaleString()}*/}
                                    {/*</span>*/}
                                </section>
                                {/*STAND ROW*/}
                                <section className={'w-full flex gap-2'}>
                                    {/* STAND */}
                                    <section className="bg-neutral-900 p-2 px-4 flex flex-col gap-4 rounded lg:w-1/2">
                                        {/* stand header */}
                                        <div className={'flex items-center justify-between'}>
                                            <section className={'flex items-center gap-2'}>
                                                <div className="h-3 w-3 rounded-full bg-teal-800"/>
                                                <h2 className='text-xl text-teal-200'>Regular Stand</h2>
                                            </section>
                                            <span className={'text-zinc-500'}>2,000 / 2,500</span>
                                        </div>

                                        {/* stand overall progress */}
                                        <div className={'flex items-center justify-between gap-2'}>
                                            <div className={'w-[80%] bg-teal-800 h-2 rounded-lg'}/>
                                            <div className={'w-[20%] bg-zinc-700 h-2 rounded-lg'}/>
                                        </div>

                                        <div className={'flex items-center justify-between gap-2'}>
                                            <section className={'text-center'}>
                                                <h3 className={'text-zinc-600 text-sm'}>INSIDE</h3>
                                                <p className={'text-2xl text-left text-teal-200'}>425</p>
                                            </section>
                                            <section className={'text-center'}>
                                                <h3 className={'text-zinc-600 text-sm'}>OUTSIDE</h3>
                                                <p className={'text-2xl text-right text-teal-200'}>239</p>
                                            </section>
                                        </div>

                                        {/*<span className='text-2xl text-zinc-300'>*/}
                                        {/*    {Number(eventStats?.totalTicketsBought)?.toLocaleString()}*/}
                                        {/*</span>*/}
                                    </section>

                                    {/* STAND */}
                                    <section className="bg-neutral-900 p-2 px-4 flex flex-col gap-4 rounded lg:w-1/2">
                                        {/* stand header */}
                                        <div className={'flex items-center justify-between'}>
                                            <section className={'flex items-center gap-2'}>
                                                <div className="h-3 w-3 rounded-full bg-orange-800"/>
                                                <h2 className='text-xl text-orange-200'>Executive Stand</h2>
                                            </section>
                                            <span className={'text-zinc-500'}>2,000 / 2,500</span>
                                        </div>

                                        {/* stand overall progress */}
                                        <div className={'flex items-center justify-between gap-2'}>
                                            <div className={'w-[80%] bg-orange-800 h-2 rounded-lg'}/>
                                            <div className={'w-[20%] bg-zinc-700 h-2 rounded-lg'}/>
                                        </div>

                                        <div className={'flex items-center justify-between gap-2'}>
                                            <section className={'text-center'}>
                                                <h3 className={'text-zinc-600 text-sm'}>INSIDE</h3>
                                                <p className={'text-2xl text-left text-orange-200'}>121</p>
                                            </section>
                                            <section className={'text-center'}>
                                                <h3 className={'text-zinc-600 text-sm'}>OUTSIDE</h3>
                                                <p className={'text-2xl text-right text-orange-200'}>98</p>
                                            </section>
                                        </div>

                                        {/*<span className='text-2xl text-zinc-300'>*/}
                                        {/*    {Number(eventStats?.totalTicketsBought)?.toLocaleString()}*/}
                                        {/*</span>*/}
                                    </section>
                                </section>
                            </div>
                        </div>
                    ) : null}

                    {!selectedEvent ? null : (
                        <div className='mt-10'>
                            <h2 className="text-3xl text-zinc-500 mb-2">Recent Scans</h2>
                            <section
                                className='border-zinc-900 bg-zinc-900 rounded-md border-2 h-76 overflow-y-auto flex flex-col items-center justify-center gap-2 p-2'>
                                <MdSecurity size={32} color={'text-orange-300'}/>
                                <h2 className=" text-zinc-500">No one has checked in yet</h2>
                            </section>
                            
                        </div>
                    )}

                </section>


                {(monitorMode || !selectedEvent) ? null : (
                   <TicketScanner 
                       resetTicketOperationAction={resetTicketOperation}
                       selectTicketOperationAction={selectTicketOperation}
                       ticketOperation={ticketOperation}
                       canScan={canScan}
                       cleanupDialogStateAction={cleanupDialogState}
                       selectedEvent={selectedEvent}
                       currentTicket={currentTicket}
                       loading={loading}
                       toggleScanModeAction={toggleScanMode}
                       handleScanAction={handleScan}
                       openApprovalModalAction={openApprovalModal}
                       computedStatus={computedStatus}
                       handleBlockingTicketAction={handleBlockingTicket}
                       handleCheckingUserInAction={handleCheckingUserIn}
                       handleCheckingUserOutAction={handleCheckingUserOut}
                       isCheckingUserOut={isCheckingUserOut}
                       updateOpenApprovalModalAction={setOpenApprovalModal}
                   />
                )}
            </div>
            
        </div>
    )
}

export default AdminTicketScanner