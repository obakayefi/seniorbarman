"use client"
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";

export default function TicketDetailView() {
    const [tickets, setTickets] = useState([])
    const [eventInfo, setEventInfo] = useState<any>({})
    const [ticketSummary, setTicketSummary] = useState<{}[]>([])
    const [pendingOrders, setPendingOrders] = useState<any[]>([])
    const params = useParams()
    const { user } = useApp()
    const [loading, setLoading] = useState(true)
    const [nullifying, setNullifying] = useState(false)
    const router = useRouter()

    const getTickets = async () => {
        try {
            setLoading(true)
            const { data } = await api.get(`/tickets/${params.id}`);
            setEventInfo(data.response.event);
            setTickets(data.response.tickets?.tickets || []);
            setTicketSummary(data.response.summary);
            setPendingOrders(data.response.pendingOrders || []);
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (params.id) getTickets();
    }, [params.id])

    const handleNullify = async () => {
        if (!confirm("This event no longer exists. Are you sure you want to nullify all associated tickets? This action cannot be undone.")) return;

        try {
            setNullifying(true)
            const res = await api.delete(`/tickets?eventId=${eventInfo._id}`);
            if (res.data.success) {
                toast.success(res.data.message);
                router.push('/u/tickets');
            }
        } catch (error: any) {
            toast.error("Failed to nullify tickets: " + (error.response?.data?.error || error.message));
        } finally {
            setNullifying(false)
        }
    }

    const [generating, setGenerating] = useState<string | null>(null)

    const handleGenerate = async (reference: string) => {
        try {
            setGenerating(reference)
            // Call the generation endpoint passing the reference ID 
            const res = await api.get(`/ticket-order?reference=${reference}`)
            if (res.data.createdTickets) {
                toast.success("Tickets successfully generated!")
                // Refresh data
                getTickets()
            }
        } catch (error: any) {
            toast.error("Failed to generate tickets: " + (error.response?.data?.error || error.message))
        } finally {
            setGenerating(null)
        }
    }

    return (
        <>
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    <h2 className="text-muted-foreground text-sm font-semibold">Getting Ticket Details...</h2>
                </div>
            ) : tickets.length ? (
                <div>
                    <div className="mb-6">
                        <Link href={'/u/tickets'} className={'text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors'}>
                            <MoveLeft />
                            <span>Back to Tickets</span>
                        </Link>
                    </div>

                    {/* Pending Orders Section */}
                    {pendingOrders.length > 0 && (
                        <div className="mb-8 bg-red-500/5 border border-red-500/20 rounded-sm p-6 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />
                            <div className="flex items-center gap-3 mb-6 relative">
                                <div className="p-2 bg-red-500/10 rounded-sm">
                                    <AlertTriangle className="text-red-500 w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-foreground uppercase tracking-tight leading-tight">Generate Purchased Tickets</h2>
                                    <p className="text-xs text-muted-foreground">You have ungenerated tickets. Generate them now to reveal your QR codes.</p>
                                </div>
                            </div>
                            <div className="space-y-3 relative">
                                {pendingOrders.map(order => (
                                    <div key={order._id} className="bg-muted/50 border border-border p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-muted/75">
                                        <div className="space-y-2">
                                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Order Ref: <span className="text-foreground font-mono ml-2">{order.reference}</span></p>
                                            <div className="flex flex-wrap gap-2 text-sm">
                                                {Object.entries(order.tickets || {}).map(([type, qty]: [string, any]) => {
                                                    // Handle robust ticket formats
                                                    const ticketType = typeof qty === 'object' ? (qty.name || type) : type;
                                                    const ticketQty = typeof qty === 'object' ? (qty.quantity || qty.qty || 1) : qty;
                                                    return (
                                                        <span key={type} className="bg-background border border-border px-3 py-1.5 rounded-sm flex items-center">
                                                            <span className="text-muted-foreground mr-2 text-[10px] uppercase font-black tracking-widest">{ticketType}</span>
                                                            <span className="font-bold text-foreground text-sm">×{ticketQty}</span>
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleGenerate(order.reference)}
                                            disabled={generating === order.reference}
                                            className="bg-red-600 hover:bg-red-700 text-white font-black h-12 px-8 shrink-0 uppercase tracking-widest text-xs rounded-sm shadow-md"
                                        >
                                            {generating === order.reference ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Generating...</span>
                                                </div>
                                            ) : (
                                                "Generate Now"
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Orphaned Event Banner */}
                    {eventInfo?.isOrphaned && (
                        <div className="mb-8 p-6 bg-red-500/5 border border-red-500/20 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-sm bg-red-500/10 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="text-red-500" size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Event No Longer Exists</h3>
                                    <p className="text-sm text-muted-foreground">The organizer has removed this event. These tickets are no longer valid for check-in.</p>
                                </div>
                            </div>
                            <Button
                                onClick={handleNullify}
                                disabled={nullifying}
                                className="w-full md:w-fit h-14 px-8 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
                            >
                                {nullifying ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Nullifying Tickets...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Trash2 size={18} />
                                        <span>Nullify All Tickets</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Sport View */}
                    {eventInfo?.type === 'sports' ? (
                        <div className="rounded-sm overflow-hidden">
                            <div className='bg-card border border-border rounded-sm justify-center flex flex-col items-center mb-4 py-6 shadow-sm'>
                                <section className='flex flex-col sm:flex-row items-center gap-6 md:gap-10 mr-0 md:mr-5'>
                                    <div className='flex md:flex-row flex-col-reverse text-center gap-2 items-center'>
                                        <h2 className="text-sm lg:text-xl text-foreground font-bold">{eventInfo?.homeTeam?.name ?? eventInfo?.homeTeam}</h2>
                                        <Image className={'w-12 md:w-24'} src={eventInfo?.homeTeam?.logo || giveLogo(eventInfo?.homeTeam)} alt='logo'
                                            height={100}
                                            width={150} />
                                    </div>
                                    <span
                                        className='text-xl text-orange-500 bg-muted p-2 h-10 w-10 flex items-center justify-center rounded-full font-bold shadow-sm'>vs</span>
                                    <div className='flex md:flex-row flex-col text-center gap-2 items-center'>
                                        <Image className={'w-12 md:w-24'} src={eventInfo?.awayTeam?.logo || giveLogo(eventInfo?.awayTeam)} alt='logo'
                                            height={100}
                                            width={125} />
                                        <h2 className="text-sm lg:text-xl text-foreground font-bold">{eventInfo?.awayTeam?.name ?? eventInfo?.awayTeam}</h2>
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
                        <div className="rounded-sm overflow-hidden">
                            {/* Event View with poster background */}
                            <div
                                className='relative border border-border rounded-sm overflow-hidden transition-all duration-500 shadow-sm'
                                style={{
                                    backgroundImage: `url(${eventInfo.image || 'https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024'})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-900/40 to-black/20" />

                                {/* Glassmorphic Content Card */}
                                <div className="relative z-10 bg-zinc-950/60 backdrop-blur-2xl border border-white/10 min-h-[450px] flex flex-col items-center justify-center py-12 px-6 sm:px-10 md:px-16 rounded-sm transition-all duration-500">
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
                                                    <p className='text-zinc-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em]'>Date</p>
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
                                                    <p className='text-zinc-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em]'>Time</p>
                                                    <p className='text-white text-base sm:text-xl font-bold'>{eventInfo?.date ? new Date(eventInfo.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Venue Row (Focused) */}
                                        <div className="flex flex-col gap-3 items-center text-center w-full bg-white/5 py-6 px-4 rounded-sm border border-white/10 backdrop-blur-sm">
                                            <div className="p-3 bg-orange-500/10 rounded-full border border-orange-500/20">
                                                <MdStadium className='text-orange-400' size={28} />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className='text-zinc-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]'>Venue</p>
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
                            <h2 className="text-2xl text-muted-foreground">No Tickets Found</h2>
                            <p className="text-muted-foreground mt-2">Unable to display tickets for this event.</p>
                        </div>
                    )}
                </div>
            ) : pendingOrders.length > 0 && eventInfo ? (
                <div>
                    <div className="mb-6">
                        <Link href={'/u/tickets'} className={'text-zinc-700 flex items-center gap-2'}>
                            <MoveLeft />
                            <span className={'text-zinc-700'}>Back to Tickets</span>
                        </Link>
                    </div>
                    {/* Pending Orders Section (Rendered even if 0 generated tickets exist) */}
                    <div className="mb-8 bg-zinc-900/40 backdrop-blur-md border border-red-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />
                        <div className="flex items-center gap-3 mb-6 relative">
                            <div className="p-2 bg-red-500/10 rounded-xl">
                                <AlertTriangle className="text-red-500 w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-tight leading-tight">Generate Purchased Tickets</h2>
                                <p className="text-xs text-zinc-400">You have ungenerated tickets. Generate them now to reveal your QR codes.</p>
                            </div>
                        </div>
                        <div className="space-y-3 relative">
                            {pendingOrders.map(order => (
                                <div key={order._id} className="bg-zinc-950/60 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-zinc-950/80">
                                    <div className="space-y-2">
                                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Order Ref: <span className="text-zinc-300 font-mono ml-2">{order.reference}</span></p>
                                        <div className="flex flex-wrap gap-2 text-sm">
                                            {Object.entries(order.tickets || {}).map(([type, qty]: [string, any]) => {
                                                const ticketType = typeof qty === 'object' ? (qty.name || type) : type;
                                                const ticketQty = typeof qty === 'object' ? (qty.quantity || qty.qty || 1) : qty;
                                                return (
                                                    <span key={type} className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg flex items-center">
                                                        <span className="text-zinc-400 mr-2 text-[10px] uppercase font-black tracking-widest">{ticketType}</span>
                                                        <span className="font-bold text-white text-sm">×{ticketQty}</span>
                                                    </span>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleGenerate(order.reference)}
                                        disabled={generating === order.reference}
                                        className="bg-red-600 hover:bg-red-700 text-white font-black h-12 px-8 shrink-0 uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-red-900/20"
                                    >
                                        {generating === order.reference ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Generating...</span>
                                            </div>
                                        ) : (
                                            "Generate Now"
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="text-center py-20 bg-zinc-900/20 rounded-2xl border border-white/5 mt-8">
                        <h2 className="text-2xl font-black text-zinc-600 uppercase tracking-tight">No Tickets Active</h2>
                        <p className="text-zinc-500 mt-2 text-sm">Generate your pending orders above to access your tickets.</p>
                    </div>
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
