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
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";

const TicketCarousel = dynamic(() => import("./TicketCarousel"), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-xs text-muted-foreground">Preparing ticket pass...</p>
        </div>
    )
});

function formatOrderTickets(ticketsData: any) {
    if (Array.isArray(ticketsData)) {
        return ticketsData.map((item: any, idx: number) => ({
            key: item._id || item.name || idx,
            type: item.name || item.type || "Ticket",
            qty: item.quantity ?? item.qty ?? 1
        }));
    }
    if (typeof ticketsData === "object" && ticketsData !== null) {
        return Object.entries(ticketsData).map(([type, qty]: [string, any]) => ({
            key: type,
            type: typeof qty === 'object' ? (qty.name || type) : type,
            qty: typeof qty === 'object' ? (qty.quantity || qty.qty || 1) : qty
        }));
    }
    return [];
}

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
            const { data } = await api.get(`/tickets/${params.id}?t=${Date.now()}`);
            setEventInfo(data.response.event);
            setTickets(data.response.tickets?.tickets || []);
            setTicketSummary(data.response.summary || []);
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
            const created = res.data.createdTickets || []
            if (created.length > 0 || res.data.message || res.status === 200) {
                toast.success("Tickets successfully generated!")
                if (created.length > 0) {
                    setTickets((prev: any[]) => [...prev, ...created])
                    setPendingOrders((prev: any[]) => prev.filter((o: any) => o.reference !== reference))
                }
                await getTickets()
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
                    {/* {pendingOrders.length > 0 && (
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
                                                {formatOrderTickets(order.tickets).map((item) => (
                                                    <span key={item.key} className="bg-background border border-border px-3 py-1.5 rounded-sm flex items-center">
                                                        <span className="text-muted-foreground mr-2 text-[10px] uppercase font-black tracking-widest">{item.type}</span>
                                                        <span className="font-bold text-foreground text-sm">×{item.qty}</span>
                                                    </span>
                                                ))}
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
                    )} */}

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

                    {/* Sport or Event Ticket Carousel */}
                    {eventInfo ? (
                        <div className="rounded-sm overflow-hidden">
                            <TicketCarousel tickets={tickets} user={user} eventInfo={eventInfo} />
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <h2 className="text-2xl text-muted-foreground">No Tickets Found</h2>
                            <p className="text-muted-foreground mt-2">Unable to display tickets for this event.</p>
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
