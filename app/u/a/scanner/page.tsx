"use client"
import React, { useEffect, useState } from 'react'
import { useQRCode } from 'next-qrcode'
import { Switch } from "@/components/ui/switch"
import { MdSecurity, MdStadium } from "react-icons/md";
import NButton from '@/components/native/NButton';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchEventStats, getUpcomingEvents } from "@/services/actions";
import { Spinner } from "@/components/ui/spinner";
import api from '@/lib/axios';
import { IEventStats, TicketSummary } from "@/types/data";
import { extractTicketStatus } from "@/lib/utils";
import TicketScanner from "@/components/widgets/TicketScanner";
import { Delete, Power, QrCode, ShieldCheck, ShieldCheckIcon, User2Icon, UserIcon, Ticket, Users, History, UserCheck, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TbSoccerField } from "react-icons/tb";
import { toast } from 'sonner';
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { MdReport } from "react-icons/md";
import { STATUS_TEXT } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/context/AppContext';
import { ROLES } from '@/lib/roles';

// ... (PreCheckInActions, PostCheckInActions etc)


type PreCheckInActionsProps = {
    loading: boolean;
    handleCheckingUserIn: () => void;
    eventMismatch: boolean;
}

export const PreCheckInActions = ({ loading, handleCheckingUserIn, eventMismatch, handleBlockingTicket }: PreCheckInActionsProps & { handleBlockingTicket: () => void }) => {
    if (eventMismatch) return null

    return (
        <section className='border-t-1 flex justify-between gap-2 border-zinc-800 pt-4'>
            <NButton
                loading={loading}
                disabled={loading}
                onClick={handleCheckingUserIn}
                icon={<ShieldCheckIcon />}
                className='cursor-pointer font-light active:translate-x-2 border-2 border-transparent duration-50 bg-orange-500 flex-1'>
                Check In
            </NButton>

            <NButton
                loading={loading}
                disabled={loading}
                onClick={handleBlockingTicket}
                icon={<Delete />}
                className='cursor-pointer font-light active:translate-x-2 border-2 border-transparent duration-50 bg-red-500/20 text-red-500 flex-1'>
                Void
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
        <section className='border-t-1 flex justify-between gap-2 border-zinc-800 pt-4'>
            <NButton
                loading={loading}
                disabled={loading}
                onClick={handleCheckingUserOut}
                icon={<ShieldCheckIcon />}
                className='cursor-pointer font-light active:translate-x-2 border-2 border-transparent duration-50 bg-orange-500 flex-1'>
                Check Out
            </NButton>

            <NButton
                loading={loading}
                disabled={loading}
                onClick={handleBlockingTicket}
                icon={<Delete />}
                className='cursor-pointer font-light active:translate-x-2 border-2 border-transparent duration-50 bg-red-500/20 text-red-500 flex-1'>
                Void
            </NButton>
        </section>
    )
}

// const buildTicketOperationUrl = (operation: string, hash: string) => {
//    
//    
// }

export type TicketOperationType = 'check-in' | 'check-out' | 'suspend' | 'scan' | undefined

const AdminTicketScanner = () => {
    const { SVG } = useQRCode()
    const { user } = useApp()
    const isTeamManager = user?.role === ROLES.TEAM_MANAGER

    const [monitorMode, setMonitorMode] = useState<boolean>(false)
    const [openApprovalModal, setOpenApprovalModal] = useState(false)
    const [currentTicket, setCurrentTicket] = useState<TicketSummary | null>(null)
    const [targetHash, setTargetHash] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [loadingTickets, setLoadingTickets] = useState(false)
    const [ticketStatus, setTicketStatus] = useState('')
    const [isCheckingUserOut, setIsCheckingUserOut] = useState(false)
    const [isBlockingTicket, setIsBlockingTicket] = useState(false)
    const [canScan, setCanScan] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<string>('')
    const [eventType, setEventType] = useState<'sports' | 'event'>('sports')
    const [computedStatus, setComputedStatus] = useState<string | null>(null)
    const [events, setEvents] = useState<any[]>([])
    const [eventStats, setEventStats] = useState<IEventStats>({
        totalTicketsBought: 0,
        totalPeopleCheckedIn: 0,
        totalPeopleInside: 0,
        totalPeopleOutside: 0,
        standBreakdown: {}
    })
    const [ticketOperation, setTicketOperation] = useState<TicketOperationType>('check-in')
    const [recentScans, setRecentScans] = useState<any[]>([])
    const [scanError, setScanError] = useState<any>(null)
    const selectTicketOperation = (operation: TicketOperationType) => setTicketOperation(operation)
    const resetTicketOperation = () => setTicketOperation(undefined)

    // Force sports eventType for team managers
    useEffect(() => {
        if (isTeamManager && eventType !== 'sports') {
            setEventType('sports')
        }
    }, [isTeamManager, eventType])

    // Load events when event type changes
    useEffect(() => {
        async function loadEvents() {
            setLoadingTickets(true)
            setSelectedEvent('') // Clear selection when switching types
            try {
                const response = await getUpcomingEvents(true, eventType)
                if (response?.data?.events) {
                    setEvents(response.data.events)
                } else {
                    setEvents([])
                }
            } catch (error) {
                console.error("Failed to load events:", error)
                setEvents([])
            } finally {
                setLoadingTickets(false)
            }
        }
        loadEvents()
    }, [eventType])

    const toggleScanMode = () => setCanScan(scan => !scan)
    const toggleMonitorMode = () => setMonitorMode(!monitorMode)

    const handleScan = async (detectedCodes: any) => {
        if (!detectedCodes || detectedCodes.length === 0) return;

        const rawValue = detectedCodes[detectedCodes.length - 1].rawValue;
        const parts = rawValue.split('/').filter(Boolean)
        const ticketHash = parts[parts.length - 1]

        const selectedEventData = events.find(e => e._id === selectedEvent);
        const isAudition = selectedEventData?.isAudition;

        let operationUrl;
        if (isAudition) {
            operationUrl = `/api/applications/${ticketHash}/${ticketOperation === 'check-in' ? 'check-in' : 'check-out'}`;
        } else {
            if (ticketOperation === 'check-in') {
                operationUrl = `/tickets/${ticketHash}/check-ticket-in`
            } else if (ticketOperation === 'check-out') {
                operationUrl = `/tickets/${ticketHash}/check-ticket-out`
            }
        }

        if (!operationUrl || !ticketHash) {
            toast.error("Could not process scan. Ensure an operation is selected.");
            return;
        }

        setLoading(true);
        setCanScan(false);
        setScanError(null); // Clear previous errors
        setTargetHash(ticketHash);

        try {
            const { data } = await api.post(operationUrl, { eventId: selectedEvent })
            const ticket = data.result.ticket
            
            // Map application fields to match ticket structure for UI if it's an audition
            if (isAudition) {
                ticket.createdBy = ticket.user; // Application uses 'user' instead of 'createdBy'
                ticket.stand = "Audition";
            }

            setCurrentTicket(ticket)
            setTicketStatus(ticket.status)
            setComputedStatus(extractTicketStatus(ticket.checkInLogs))

            if (data.result.eventTicketStats) {
                setEventStats(data.result.eventTicketStats);
            }

            // Record recent scan
            setRecentScans(prev => [{
                time: new Date().toLocaleTimeString(),
                userName: ticket.createdBy?.firstName || "Unknown",
                stand: ticket.stand || "Unknown Stand",
                status: ticketOperation === 'check-in' ? "IN" : "OUT",
                success: true
            }, ...prev].slice(0, 10))
            
            setOpenApprovalModal(true);
        } catch (error: any) {
            console.error("Scan error:", error);
            const errorData = error.response?.data;

            // Set error state for modal
            setScanError({
                title: errorData?.error || "Error processing ticket",
                message: errorData?.details?.message || "An unexpected error occurred while processing the ticket.",
                suggestion: errorData?.details?.suggestion,
                canVoid: errorData?.details?.canVoid,
                canCheckOut: errorData?.details?.canCheckOut,
                ticket: errorData?.ticket || errorData?.details?.ticket // Check both locations
            });

            setOpenApprovalModal(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentTicket?.checkInLogs) {
            setComputedStatus(extractTicketStatus(currentTicket.checkInLogs))
        }
    }, [currentTicket]);

    const getEventStats = async () => {
        if (!selectedEvent) return;
        const stats = await fetchEventStats(selectedEvent)
        if (stats?.eventTicketStats) {
            setEventStats(stats.eventTicketStats)
        }
    }

    useEffect(() => {
        if (!selectedEvent) return
        getEventStats()

        // SSE connection for monitor mode
        let eventSource: EventSource | null = null;
        if (monitorMode) {
            eventSource = new EventSource(`/api/events/${selectedEvent}/stream`);

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "connected") {
                    console.log("SSE connected for event:", data.eventId);
                } 
                
                if (data.eventTicketStats) {
                    setEventStats(data.eventTicketStats);
                }

                if (data.type === "new_scan" && data.scan) {
                    setRecentScans(prev => [data.scan, ...prev].slice(0, 10));
                }
            };

            eventSource.onerror = (error) => {
                console.error("SSE error:", error);
                eventSource?.close();
            };
        }

        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [selectedEvent, monitorMode]);

    const handleCheckingUserOut = async () => {
        setIsCheckingUserOut(true)
        const isAudition = selectedEventData?.isAudition;
        const url = isAudition 
            ? `/api/applications/${targetHash}/check-out`
            : `/tickets/${targetHash}/check-ticket-out`;

        try {
            const { data } = await api.post(url, { eventId: selectedEvent })
            const ticket = data.result.ticket;
            if (isAudition) {
                ticket.createdBy = ticket.user;
                ticket.stand = "Audition";
            }
            setComputedStatus(extractTicketStatus(ticket.checkInLogs))
            if (data.result.eventTicketStats) setEventStats(data.result.eventTicketStats)
            toast.success(`${isAudition ? 'Applicant' : 'User'} checked out successfully`);
            setTimeout(() => cleanupDialogState(), 700);
        } catch (error) {
            toast.error("Error checking out");
        } finally {
            setIsCheckingUserOut(false)
        }
    }

    const handleBlockingTicket = async () => {
        setIsBlockingTicket(true)
        const isAudition = selectedEventData?.isAudition;
        
        try {
            if (isAudition) {
                // Reject application at the gate
                await api.patch(`/events/${selectedEvent}/applicants/${targetHash}`, { 
                    status: 'rejected', 
                    reason: 'Rejected at gate scanner' 
                });
                toast.success("Application revoked successfully");
            } else {
                // Block regular ticket
                await api.post(`/tickets/${targetHash}/block-ticket`)
                toast.success("Ticket blocked successfully");
            }
            cleanupDialogState();
        } catch (error) {
            toast.error(`Error ${isAudition ? 'revoking application' : 'blocking ticket'}`);
        } finally {
            setIsBlockingTicket(false)
        }
    }

    const handleCheckingUserIn = async () => {
        setLoading(true)
        const isAudition = selectedEventData?.isAudition;
        const url = isAudition 
            ? `/api/applications/${targetHash}/check-in`
            : `/tickets/${targetHash}/check-ticket-in`;

        try {
            const { data } = await api.post(url, { eventId: selectedEvent })
            const ticket = data.result.ticket;
            if (isAudition) {
                ticket.createdBy = ticket.user;
                ticket.stand = "Audition";
            }
            setComputedStatus(extractTicketStatus(ticket.checkInLogs))
            if (data.result.eventTicketStats) setEventStats(data.result.eventTicketStats)
            toast.success(`${isAudition ? 'Applicant' : 'User'} checked in successfully`);
            setTimeout(() => cleanupDialogState(), 700);
        } catch (error) {
            toast.error("Error checking in");
        } finally {
            setLoading(false)
        }
    }

    const cleanupDialogState = () => {
        setOpenApprovalModal(false);
        setCurrentTicket(null)
        setScanError(null)
        setCanScan(true) // Re-enable scanning for next ticket
    }

    const selectedEventData = events.find(e => e._id === selectedEvent);

    return (
        <div className='min-h-screen bg-black text-white p-4 sm:p-8 lg:p-12 overflow-y-auto'>
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="space-y-2">
                    <h1 className='text-3xl sm:text-5xl font-black flex items-center gap-3 tracking-tighter'>
                        TICKET <span className="text-orange-500">SCANNER</span>
                        <QrCode size={40} className='text-orange-500' />
                    </h1>
                    <p className="text-zinc-500 font-medium">Administrative Access Only</p>
                </div>

                {/* Global Status Pill */}
                {selectedEventData && (
                    <div className="flex items-center gap-3 bg-zinc-900/50 backdrop-blur-md border border-white/5 px-4 py-2 rounded-full">
                        <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${monitorMode ? 'bg-green-500' : 'bg-orange-500'}`} />
                        <span className="text-sm font-bold uppercase tracking-widest text-zinc-300">
                            {monitorMode ? 'Real-time Monitoring' : 'Field Entry Active'}
                        </span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Controls & Selection */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Event Selection & Global Stats */}
                    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                            <div className="space-y-4">
                                {/* Event Type Toggle */}
                                {!isTeamManager && (
                                    <div className="mb-4">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 px-1 block mb-3">Event Type</label>
                                        <div className="flex gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-white/5">
                                            <button
                                                onClick={() => setEventType('sports')}
                                                className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${eventType === 'sports'
                                                    ? 'bg-orange-500 text-white shadow-lg'
                                                    : 'text-zinc-400 hover:text-white'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <TbSoccerField size={18} />
                                                    <span>Football</span>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => setEventType('event')}
                                                className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${eventType === 'event'
                                                    ? 'bg-orange-500 text-white shadow-lg'
                                                    : 'text-zinc-400 hover:text-white'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <Ticket size={18} />
                                                    <span>Regular Events</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 px-1">Select Active Event</label>
                                <div className="relative group">
                                    {events.length > 0 ? (
                                        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                                            <SelectTrigger className="w-full bg-zinc-950 border-white/10 text-white h-14 rounded-2xl focus:ring-orange-500/20">
                                                <SelectValue placeholder="Identify the target event" />
                                            </SelectTrigger>
                                            <SelectContent className='bg-zinc-950 border-white/10 text-white rounded-2xl shadow-2xl'>
                                                {events.map(event => (
                                                    <SelectItem key={event._id} value={event._id} className="focus:bg-orange-500 focus:text-white rounded-xl py-3 cursor-pointer">
                                                        {event.type === 'sports' ? (
                                                            <div className="flex items-center gap-3">
                                                                <TbSoccerField className="text-orange-500" />
                                                                <span className="font-bold">{(event.homeTeam as any)?.name ?? event.homeTeam} <span className="text-zinc-500 font-normal">v</span> {(event.awayTeam as any)?.name ?? event.awayTeam}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-3">
                                                                <Ticket size={16} className="text-orange-500" />
                                                                <span className="font-bold">{event.title}</span>
                                                            </div>
                                                        )}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : loadingTickets ? (
                                        <div className="h-14 bg-zinc-950/50 rounded-2xl flex items-center px-4 gap-3">
                                            <Spinner className="text-orange-500" />
                                            <span className="text-zinc-500 text-sm">Initializing resources...</span>
                                        </div>
                                    ) : (
                                        <div className="h-14 bg-zinc-950/50 rounded-2xl flex items-center px-4 gap-3 border border-dashed border-white/10">
                                            <MdReport className="text-zinc-600" />
                                            <span className="text-zinc-600 text-sm italic">No scheduled events found</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Monitor Mode</label>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${monitorMode ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                        {monitorMode ? 'AUTO-REFRESH' : 'MANUAL'}
                                    </span>
                                </div>
                                <div className="bg-zinc-950 border border-white/10 h-14 rounded-2xl flex items-center justify-between px-6">
                                    <span className="text-sm font-medium text-zinc-400">{monitorMode ? "Broadcast Active" : "Scanning Priority"}</span>
                                    <Switch checked={monitorMode} onCheckedChange={toggleMonitorMode} className="data-[state=checked]:bg-green-500" />
                                </div>
                            </div>
                        </div>

                        {/* High Level Metrics */}
                        {selectedEventData && eventStats && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
                                <div className="text-center p-4 rounded-2xl bg-white/2">
                                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-tighter mb-1">Checked In</p>
                                    <p className="text-2xl font-black text-white">{eventStats.totalPeopleCheckedIn || 0}</p>
                                </div>
                                <div className="text-center p-4 rounded-2xl bg-white/2">
                                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-tighter mb-1">Inside Now</p>
                                    <p className="text-2xl font-black text-green-500">{eventStats.totalPeopleInside || 0}</p>
                                </div>
                                <div className="text-center p-4 rounded-2xl bg-white/2">
                                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-tighter mb-1">Sold Out</p>
                                    <p className="text-2xl font-black text-zinc-400">{eventStats.totalTicketsBought || 0}</p>
                                </div>
                                <div className="text-center p-4 rounded-2xl bg-white/2">
                                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-tighter mb-1">At Exit</p>
                                    <p className="text-2xl font-black text-red-400">{eventStats.totalPeopleOutside || 0}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detailed Stand/Type Stats */}
                    {selectedEventData && eventStats?.standBreakdown && (
                        <div className="space-y-6">
                            <h2 className='text-xl sm:text-2xl font-black flex items-center gap-3 px-2 tracking-tight'>
                                <Users size={22} className="text-orange-500" />
                                DETAILED OCCUPANCY
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(eventStats.standBreakdown).map(([name, data]: [string, any], idx) => (
                                    <div key={idx} className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl shadow-xl hover:bg-zinc-900/60 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                                                <h3 className="text-lg font-bold text-white uppercase">{name}</h3>
                                            </div>
                                            <span className="text-xs font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded-lg">
                                                {data.inside}/{data.total}
                                            </span>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden mb-6">
                                            <div
                                                className="h-full bg-orange-500 transition-all duration-1000 ease-out"
                                                style={{ width: `${(data.inside / data.total) * 100}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">Total In</p>
                                                <p className="text-3xl font-black text-white">{data.inside || 0}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">Cap. Left</p>
                                                <p className="text-xl font-bold text-zinc-400">{(data.total - data.inside) || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Scans Area */}
                    <div className="pt-4 space-y-4">
                        <h2 className='text-xl sm:text-2xl font-black flex items-center gap-3 px-2 tracking-tight'>
                            <History size={24} className="text-zinc-500" />
                            RECENT ACTIVITY
                        </h2>
                        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl min-h-[160px] overflow-hidden">
                            {recentScans.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {recentScans.map((scan, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 hover:bg-white/2 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-full ${scan.status === 'IN' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {scan.status === 'IN' ? <UserCheck size={16} /> : <UserMinus size={16} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{scan.userName}</p>
                                                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{scan.stand}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-white">{scan.status}</p>
                                                <p className="text-[10px] text-zinc-500 font-medium">{scan.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 text-center gap-3">
                                    <div className="p-4 bg-zinc-950/50 rounded-full">
                                        <ShieldCheck className="text-zinc-700" size={32} />
                                    </div>
                                    <p className="text-sm font-medium text-zinc-600 italic">Security log is ready. Waiting for scan detection...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Scanner UI */}
                <div className="lg:col-span-4 max-w-sm mx-auto w-full">
                    {!monitorMode && selectedEvent && (
                        <div className="sticky top-12 space-y-6">
                            <div className="bg-zinc-900 border-2 border-orange-500/20 rounded-[2rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(249,115,22,0.15)]">
                                <div className="p-1 px-4 py-3 bg-orange-500 flex justify-between items-center text-white">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Entry Command Center</span>
                                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                </div>

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
                                    scanError={scanError}
                                    onResetError={() => setScanError(null)}
                                    isAudition={selectedEventData?.isAudition}
                                    isTeamManager={isTeamManager}
                                />

                                <div className="bg-zinc-950 p-6 text-center">
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Quick Diagnostic</p>
                                    <div className="flex justify-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-green-500/50" />
                                        <div className="h-2 w-2 rounded-full bg-zinc-800" />
                                        <div className="h-2 w-2 rounded-full bg-zinc-800" />
                                    </div>
                                </div>
                            </div>

                            {/* Device Warning */}
                            <div className="bg-orange-500/5 border border-orange-500/10 p-4 rounded-2xl flex items-start gap-3">
                                <MdReport className="text-orange-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-orange-200/60 leading-relaxed italic">
                                    Ensure your device camera has adequate lighting for high-speed QR detection. Manual check-in available via approval modal.
                                </p>
                            </div>
                        </div>
                    )}

                    {!selectedEvent && (
                        <div className="bg-zinc-900/50 border-2 border-dashed border-white/5 rounded-[2rem] p-12 text-center space-y-4">
                            <div className="p-6 bg-zinc-950/50 rounded-full inline-block">
                                <Power className="text-zinc-800" size={40} />
                            </div>
                            <h3 className="text-slate-500 font-bold uppercase tracking-wider text-sm">System Offline</h3>
                            <p className="text-xs text-zinc-600">Select an event from the deployment menu to initialize the security perimeter.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminTicketScanner
