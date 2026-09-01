"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    Loader2, Calendar, MapPin, ArrowLeft,
    ShieldCheck, Ticket, Info,
    Trophy, ClipboardList
} from "lucide-react"
import api from "@/lib/axios"
import Link from 'next/link'
import { format } from 'date-fns'
import { useApp } from '@/context/AppContext'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { BookRegularEventModal } from '@/components/modals/book-regular-event'
import { BookEventModal } from '@/components/modals/book-event'
import { ApplyEventModal } from '@/components/modals/apply-event-modal'
import { HunchoRoleChecker } from '@/lib/helpers'

export default function PublicEventDetailPage() {
    const params = useParams()
    const id = params.id as string
    const searchParams = useSearchParams()
    const { user } = useApp()
    const router = useRouter()

    const [event, setEvent] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    
    // Application Flow State
    const [applicationStatus, setApplicationStatus] = useState<any>(null)
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)

    const fetchEvent = async () => {
        try {
            setLoading(true)
            const res = await api.get(`/events/${id}`)
            setEvent(res.data)
            
            // If user is logged in, fetch their application status
            if (user && res.data.requiresApplication) {
                fetchApplicationStatus()
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load event details")
        } finally {
            setLoading(false)
        }
    }

    const fetchApplicationStatus = async () => {
        try {
            const res = await api.get(`/events/${id}/apply`)
            if (res.data.application) {
                setApplicationStatus(res.data.application)
            }
        } catch (error) {
            console.error("Failed to fetch application status", error)
        }
    }

    // Handle intent check on load or return from Paystack
    useEffect(() => {
        if (!user || !id) return;
        
        // Check if returning from paystack
        if (searchParams.get('applicationPaid') === 'true') {
            toast.success("Payment verified. Please complete your application form.");
            router.push(`/u/events/${id}/apply`);
            return;
        }
        
        // Check local storage for pending intent (if they just logged in)
        const intentRaw = localStorage.getItem('pendingApplication')
        if (intentRaw) {
            try {
                const intent = JSON.parse(intentRaw)
                if (intent.eventId === id) {
                    router.push(`/u/events/${id}/apply`);
                    localStorage.removeItem('pendingApplication')
                }
            } catch (e) {}
        }
    }, [user, id, searchParams])

    useEffect(() => {
        if (id) fetchEvent()
    }, [id, user])

    const handleApplyClick = () => {
        if (!user) {
            // Store intent and redirect to login/register
            localStorage.setItem('pendingApplication', JSON.stringify({ 
                eventId: id, 
                eventTitle: event.type === 'sports' ? `${event.homeTeam?.name || event.homeTeam} vs ${event.awayTeam?.name || event.awayTeam}` : event.title 
            }))
            router.push(`/auth/register?redirect=/events/${id}`)
            return;
        }
        router.push(`/u/events/${id}/apply`)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                <p className="text-lg font-medium">Loading activity...</p>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-4">
                <p className="text-xl text-foreground font-bold">This activity is no longer available.</p>
                <Button asChild variant="outline" className="rounded-sm">
                    <Link href="/events">Explore Other Events</Link>
                </Button>
            </div>
        )
    }

    const isAdmin = HunchoRoleChecker(user?.role)
    const isSports = event.type === 'sports'

    return (
        <div className="min-h-screen bg-background text-foreground pb-32 transition-colors">
            {/* Hero Section */}
            <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden text-white">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30 z-10" />
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
                        className="bg-black/40 backdrop-blur-md hover:bg-black/60 text-white border border-white/20 rounded-full h-10 w-10 p-0 shadow-md"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                </div>

                {/* Event Summary Overlay */}
                <div className="absolute bottom-0 left-0 w-full z-20 p-6 md:p-12">
                    <div className="max-w-7xl mx-auto space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none px-3 py-1 font-bold uppercase tracking-wider text-[10px] rounded-xs shadow-sm">
                                {event.category || (isSports ? 'Sports Match' : 'Featured Event')}
                            </Badge>
                            {event.requiresApplication && (
                                <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1 font-bold uppercase tracking-wider text-[10px] rounded-xs shadow-sm">
                                    <ClipboardList size={12} className="mr-1 inline" /> Application Required
                                </Badge>
                            )}
                            {isAdmin && (
                                <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-emerald-500/10 backdrop-blur-md rounded-xs">
                                    <ShieldCheck size={12} className="mr-1" /> Verified by Admin
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-6xl font-black tracking-tight leading-none uppercase text-white drop-shadow-md">
                            {isSports ? `${event.homeTeam?.name || event.homeTeam} vs ${event.awayTeam?.name || event.awayTeam}` : event.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Side: Details */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Primary Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-card border border-border dark:border-zinc-800 rounded-sm p-6 flex items-start gap-4 shadow-sm dark:shadow-black/40">
                            <div className="h-12 w-12 rounded-sm bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 text-orange-500">
                                <Calendar size={22} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Date & Time</p>
                                <p className="text-base font-bold text-foreground">{format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(event.date), 'hh:mm a')}</p>
                            </div>
                        </div>

                        <div className="bg-card border border-border dark:border-zinc-800 rounded-sm p-6 flex items-start gap-4 shadow-sm dark:shadow-black/40">
                            <div className="h-12 w-12 rounded-sm bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 text-orange-500">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Venue</p>
                                <p className="text-base font-bold text-foreground">{event.venue}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Enugu, Nigeria</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-black flex items-center gap-2.5 text-foreground uppercase tracking-tight">
                            <Info size={20} className="text-orange-500" />
                            About This Activity
                        </h2>
                        <div className="text-muted-foreground leading-relaxed text-base space-y-4">
                            <p>
                                {event.description || "Join us for an unforgettable experience at our upcoming activity. This event promises to deliver excitement, premium entertainment, and a great atmosphere for all attendees. Secure your spot now to be part of the most talked-about gathering in the city."}
                            </p>
                            {isSports && (
                                <p className="p-4 bg-muted/30 border border-border dark:border-zinc-800 rounded-sm italic text-xs text-foreground">
                                    High-stakes football encounter featuring top-tier competitive play. Gates open 2 hours before kickoff.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Booking/Application Card */}
                <div className="lg:col-span-4">
                    <div className="sticky top-12 space-y-6">
                        <div className="bg-card border border-border dark:border-zinc-800 rounded-sm overflow-hidden shadow-md dark:shadow-black/40">
                            <div className="p-6 sm:p-8 space-y-6">
                                
                                {event.requiresApplication ? (
                                    <>
                                        <div className="space-y-2">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Application Required</h3>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-muted-foreground">You must apply to attend.</p>
                                                <p className="text-xl font-black text-foreground">
                                                    {event.applicationFee > 0 ? `₦${event.applicationFee.toLocaleString()}` : "FREE"}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {!applicationStatus || (applicationStatus.status !== 'approved' && applicationStatus.status !== 'rejected') ? (
                                            <Button 
                                                onClick={handleApplyClick}
                                                className="w-full h-12 rounded-sm bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                                            >
                                                {applicationStatus ? "VIEW APPLICATION STATUS" : "START APPLICATION"}
                                            </Button>
                                        ) : applicationStatus.status === 'approved' ? (
                                            <div className="space-y-4">
                                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold text-center">Your application was approved! You can now book tickets.</p>
                                                </div>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button className="w-full h-12 rounded-sm bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm">
                                                            {event.ctaText || "BOOK TICKETS NOW"}
                                                        </Button>
                                                    </DialogTrigger>
                                                    {isSports ? (
                                                        <BookEventModal eventId={event._id} />
                                                    ) : (
                                                        <BookRegularEventModal event={event} />
                                                    )}
                                                </Dialog>
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm text-center">
                                                <p className="text-xs text-red-600 dark:text-red-400 font-bold">Your application was not approved.</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {/* Standard Ticket Booking (No App Required) */}
                                        <div className="space-y-2">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ticket Availability</h3>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Tickets Selling Fast</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {event.ticketTypes?.map((ticket: any, index: number) => (
                                                <div key={index} className="flex justify-between items-center p-3.5 bg-muted/40 dark:bg-zinc-800/40 rounded-sm border border-border dark:border-zinc-700">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{ticket.name}</p>
                                                        <p className="text-xl font-black text-foreground mt-0.5">
                                                            {ticket.price > 0 ? `₦${Number(ticket.price).toLocaleString()}` : 'FREE'}
                                                        </p>
                                                    </div>
                                                    <div className="h-9 w-9 rounded-sm bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                                        <Ticket size={18} className="text-orange-500" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="w-full h-12 rounded-sm bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm">
                                                    {event.ctaText || "BOOK TICKETS NOW"}
                                                </Button>
                                            </DialogTrigger>
                                            {isSports ? (
                                                <BookEventModal eventId={event._id} />
                                            ) : (
                                                <BookRegularEventModal event={event} />
                                            )}
                                        </Dialog>
                                    </>
                                )}

                                <p className="text-[10px] text-muted-foreground text-center uppercase tracking-wider leading-relaxed pt-2 border-t border-border dark:border-zinc-800">
                                    Instant mobile delivery • Secure 256-bit encryption • Official SeniorBarman ticketing
                                </p>
                            </div>

                            {/* Admin Quick Link */}
                            {isAdmin && (
                                <Link
                                    href={`/u/a/events/${event._id}`}
                                    className="block p-3.5 bg-muted/20 border-t border-border dark:border-zinc-800 hover:bg-muted/40 transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Trophy size={15} className="text-orange-500" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Admin Performance Stats</span>
                                        </div>
                                        <ArrowLeft size={14} className="text-muted-foreground rotate-180 group-hover:translate-x-1 group-hover:text-foreground transition-transform" />
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

