"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    Loader2, Calendar, MapPin, ArrowLeft,
    Share2, ShieldCheck, Ticket, Info,
    Trophy, Map, Clock
} from "lucide-react"
import api from "@/lib/axios"
import Link from 'next/link'
import { format } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { BookRegularEventModal } from '@/components/modals/book-regular-event'
import { BookEventModal } from '@/components/modals/book-event'

export default function PublicEventDetailPage() {
    const params = useParams()
    const id = params.id as string
    const { user } = useApp()
    const router = useRouter()

    const [event, setEvent] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchEvent = async () => {
        try {
            setLoading(true)
            const res = await api.get(`/events/${id}`)
            setEvent(res.data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load event details")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchEvent()
    }, [id])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-500 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                <p className="text-lg font-medium">Loading activity...</p>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-500 gap-4">
                <p className="text-xl">This activity is no longer available.</p>
                <Button asChild variant="outline">
                    <Link href="/events">Explore Other Events</Link>
                </Button>
            </div>
        )
    }

    const isAdmin = user?.role === 'admin'
    const isSports = event.type === 'sports'

    return (
        <div className="min-h-screen bg-black text-white pb-32">
            {/* Hero Section */}
            <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                <img
                    src={event.image || (isSports ? "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop" : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop")}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />

                {/* Back Button */}
                <div className="absolute top-6 left-6 z-20">
                    <Button
                        onClick={() => router.back()}
                        variant="ghost"
                        className="bg-black/20 backdrop-blur-md hover:bg-black/40 text-white border border-white/10 rounded-full h-10 w-10 p-0"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                </div>

                {/* Event Summary Overlay */}
                <div className="absolute bottom-0 left-0 w-full z-20 p-6 md:p-12">
                    <div className="max-w-7xl mx-auto space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className="bg-orange-600 hover:bg-orange-600 text-white border-none px-3 py-1 font-black uppercase tracking-widest text-[10px]">
                                {event.category || (isSports ? 'Sports Match' : 'Featured Event')}
                            </Badge>
                            {isAdmin && (
                                <Badge variant="outline" className="border-green-500 text-green-500 bg-green-500/5 backdrop-blur-md">
                                    <ShieldCheck size={12} className="mr-1" /> Verified by Admin
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none">
                            {isSports ? `${event.homeTeam} vs ${event.awayTeam}` : event.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Side: Details */}
                <div className="lg:col-span-8 space-y-12">
                    {/* Primary Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 flex items-start gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0">
                                <Calendar className="text-orange-500" size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Date & Time</p>
                                <p className="text-lg font-bold text-white">{format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}</p>
                                <p className="text-sm text-zinc-400">{format(new Date(event.date), 'hh:mm a')}</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 flex items-start gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0">
                                <MapPin className="text-orange-500" size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Venue</p>
                                <p className="text-lg font-bold text-white">{event.venue}</p>
                                <p className="text-sm text-zinc-400">Enugu, Nigeria</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <Info size={24} className="text-orange-500" />
                            ABOUT THIS ACTIVITY
                        </h2>
                        <div className="text-zinc-400 leading-relaxed text-lg space-y-4">
                            <p>
                                {event.description || "Join us for an unforgettable experience at our upcoming activity. This event promises to deliver excitement, premium entertainment, and a great atmosphere for all attendees. Secure your spot now to be part of the most talked-about gathering in the city."}
                            </p>
                            {isSports && (
                                <p className="p-4 bg-zinc-900/30 border border-white/5 rounded-2xl italic text-sm">
                                    High-stakes football encounter featuring top-tier competitive play. Gates open 2 hours before kickoff.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Map/Location Placeholder */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 h-48 flex flex-col items-center justify-center gap-3 text-zinc-500 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                        <Map size={32} />
                        <p className="text-xs font-bold uppercase tracking-widest tracking-tighter">View on Interactive Map</p>
                    </div>
                </div>

                {/* Right Side: Booking Card */}
                <div className="lg:col-span-4">
                    <div className="sticky top-12 space-y-6">
                        <div className="bg-zinc-900 border-2 border-orange-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="p-8 space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Ticket Availability</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-sm font-bold text-green-500 uppercase">Tickets Selling Fast</span>
                                    </div>
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-500 uppercase">Regular</p>
                                            <p className="text-2xl font-black">
                                                {event.regularPrice > 0 ? `₦${Number(event.regularPrice).toLocaleString()}` : 'FREE'}
                                            </p>
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <Ticket size={20} className="text-blue-500" />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-500 uppercase">VIP</p>
                                            <p className="text-2xl font-black">
                                                {event.vipPrice > 0 ? `₦${Number(event.vipPrice).toLocaleString()}` : 'FREE'}
                                            </p>
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                            <Ticket size={20} className="text-yellow-500" />
                                        </div>
                                    </div>
                                </div>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full h-16 rounded-2xl bg-orange-600 hover:bg-orange-700 text-lg font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-orange-600/20">
                                            BOOK TICKETS NOW
                                        </Button>
                                    </DialogTrigger>
                                    {isSports ? (
                                        <BookEventModal eventId={event._id} />
                                    ) : (
                                        <BookRegularEventModal event={event} />
                                    )}
                                </Dialog>

                                <p className="text-[10px] text-zinc-500 text-center uppercase tracking-widest leading-relaxed">
                                    Instant mobile delivery • Secure 256-bit encryption • Official SeniorBarman ticketing
                                </p>
                            </div>

                            {/* Admin Quick Link */}
                            {isAdmin && (
                                <Link
                                    href={`/u/a/events/${event._id}`}
                                    className="block p-4 bg-zinc-950/80 border-t border-white/5 hover:bg-zinc-950 transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Trophy size={16} className="text-orange-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Admin Performance Stats</span>
                                        </div>
                                        <ArrowLeft size={16} className="text-zinc-600 rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            )}
                        </div>

                        {/* Additional Info Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-4 text-center">
                                <Clock size={20} className="mx-auto mb-2 text-zinc-500" />
                                <p className="text-[8px] font-black uppercase text-zinc-600 tracking-tighter">Event Duration</p>
                                <p className="text-sm font-bold">~ 4 Hours</p>
                            </div>
                            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-4 text-center">
                                <Share2 size={20} className="mx-auto mb-2 text-zinc-500" />
                                <p className="text-[8px] font-black uppercase text-zinc-600 tracking-tighter">Share Event</p>
                                <p className="text-sm font-bold">Get Referral</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
