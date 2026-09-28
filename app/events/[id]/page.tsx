"use client"
import React, { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    Loader2, Calendar, MapPin, ArrowLeft,
    ShieldCheck, Ticket, Info,
    Trophy, ClipboardList, Share2, Clock, CheckCircle2,
    Sparkles, UserCheck, Shield, ExternalLink
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
import { ShareEventModal } from '@/components/modals/share-event-modal'

function PublicEventDetailContent() {
    const params = useParams()
    const id = params.id as string
    const searchParams = useSearchParams()
    const { user } = useApp()
    const router = useRouter()

    const [event, setEvent] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [shareModalOpen, setShareModalOpen] = useState(false)
    
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
                <p className="text-lg font-medium">Loading experience...</p>
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
    const eventDateObj = new Date(event.date)
    const isPast = eventDateObj < new Date()
    const isAudition = Boolean(event.isAudition)
    const eventTitle = isSports 
        ? `${event.homeTeam?.name || event.homeTeam} vs ${event.awayTeam?.name || event.awayTeam}` 
        : event.title

    return (
        <div className="min-h-screen bg-background text-foreground pb-32 transition-colors">
            {/* Share Modal Dialog */}
            <ShareEventModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                event={event}
            />

            {/* Hero Section */}
            <div className="relative min-h-[50vh] md:min-h-[65vh] w-full overflow-hidden text-white flex flex-col justify-between">
                {/* Background image & deep gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/30 z-10" />
                <img
                    src={event.image || (isSports ? "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=crop" : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop")}
                    alt={eventTitle}
                    className="absolute inset-0 w-full h-full object-cover filter brightness-90 transform scale-105 transition-transform duration-1000 ease-out"
                />

                {/* Top Navigation Bar overlay */}
                <div className="relative z-20 max-w-7xl w-full mx-auto p-6 md:p-10 flex items-center justify-between">
                    <Button
                        onClick={() => router.back()}
                        variant="ghost"
                        className="bg-black/50 backdrop-blur-md hover:bg-black/75 text-white border border-white/20 rounded-full h-10 w-10 p-0 shadow-lg cursor-pointer transition-all"
                    >
                        <ArrowLeft size={18} />
                    </Button>

                    <Button
                        onClick={() => setShareModalOpen(true)}
                        className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/25 rounded-full px-4 h-10 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                    >
                        <Share2 size={15} className="text-orange-400" />
                        <span>Share Event</span>
                    </Button>
                </div>

                {/* Event Summary Overlay */}
                <div className="relative z-20 max-w-7xl w-full mx-auto p-6 md:p-12 pb-10 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {isAudition ? (
                            <Badge className="bg-purple-600 hover:bg-purple-700 text-white border-none px-3 py-1 font-black uppercase tracking-wider text-[10px] rounded-xs shadow-md">
                                <Sparkles size={11} className="mr-1 inline" /> Official Audition
                            </Badge>
                        ) : (
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none px-3 py-1 font-black uppercase tracking-wider text-[10px] rounded-xs shadow-md">
                                {event.category || (isSports ? 'Sports Match' : 'Live Event')}
                            </Badge>
                        )}
                        {event.requiresApplication && (
                            <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1 font-bold uppercase tracking-wider text-[10px] rounded-xs shadow-md">
                                <ClipboardList size={11} className="mr-1 inline" /> Application Required
                            </Badge>
                        )}
                        {isAdmin && (
                            <Badge variant="outline" className="border-emerald-500 text-emerald-400 bg-emerald-500/20 backdrop-blur-md rounded-xs">
                                <ShieldCheck size={11} className="mr-1" /> Verified by Admin
                            </Badge>
                        )}
                    </div>

                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight uppercase text-white drop-shadow-lg max-w-4xl">
                        {eventTitle}
                    </h1>

                    {/* Quick highlights bar */}
                    <div className="flex flex-wrap items-center gap-4 text-white/90 text-xs sm:text-sm font-medium pt-2">
                        <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/10">
                            <Calendar size={14} className="text-orange-400" />
                            {format(eventDateObj, 'EEE, MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/10">
                            <Clock size={14} className="text-orange-400" />
                            {format(eventDateObj, 'hh:mm a')}
                        </span>
                        <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/10">
                            <MapPin size={14} className="text-orange-400" />
                            {event.venue}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Details & Story */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Primary Highlight Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="bg-card border border-border dark:border-zinc-800 rounded-sm p-6 flex items-start gap-4 shadow-sm hover:border-orange-500/40 transition-colors">
                            <div className="h-12 w-12 rounded-sm bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 text-orange-500">
                                <Calendar size={22} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Date & Time</p>
                                <p className="text-base font-bold text-foreground">{format(eventDateObj, 'EEEE, MMMM dd, yyyy')}</p>
                                <p className="text-xs text-muted-foreground">{format(eventDateObj, 'hh:mm a')} (WAT)</p>
                            </div>
                        </div>

                        <div className="bg-card border border-border dark:border-zinc-800 rounded-sm p-6 flex items-start gap-4 shadow-sm hover:border-orange-500/40 transition-colors">
                            <div className="h-12 w-12 rounded-sm bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20 text-orange-500">
                                <MapPin size={22} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Venue & Location</p>
                                <p className="text-base font-bold text-foreground">{event.venue}</p>
                                <p className="text-xs text-muted-foreground">Enugu, Nigeria</p>
                            </div>
                        </div>
                    </div>

                    {/* About The Event Description */}
                    <div className="bg-card border border-border dark:border-zinc-800 rounded-sm p-6 sm:p-8 space-y-5 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <h2 className="text-lg font-black flex items-center gap-2.5 text-foreground uppercase tracking-tight">
                                <Info size={18} className="text-orange-500" />
                                {isAudition ? "Audition Overview & Guidelines" : "About This Activity"}
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShareModalOpen(true)}
                                className="h-8 text-xs font-bold text-orange-500 hover:text-orange-600 gap-1.5"
                            >
                                <Share2 size={13} />
                                Share
                            </Button>
                        </div>
                        
                        <div className="text-muted-foreground leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-line">
                            {event.description ? (
                                <p>{event.description}</p>
                            ) : (
                                <p>
                                    Join us for an unforgettable experience at our upcoming activity. This event promises to deliver excitement, premium entertainment, and a vibrant atmosphere for all attendees. Secure your spot now to be part of the most talked-about gathering in the city.
                                </p>
                            )}

                            {isSports && (
                                <div className="p-4 bg-muted/40 border border-border rounded-sm text-xs text-foreground space-y-1">
                                    <p className="font-bold uppercase tracking-wider text-[10px] text-orange-500">Match Day Advisory</p>
                                    <p>High-stakes encounter featuring top-tier competitive play. Gates open 2 hours before kickoff. Please arrive early for smooth check-in.</p>
                                </div>
                            )}

                            {isAudition && (
                                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-sm text-xs text-foreground space-y-1">
                                    <p className="font-bold uppercase tracking-wider text-[10px] text-purple-400">Audition Candidate Requirements</p>
                                    <p>All candidates must complete the official application form below. Ensure contact details and submitted information are accurate for callback scheduling.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Trust & Guarantee Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-sm">
                            <Shield className="text-emerald-500 h-5 w-5 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-foreground">Verified Event</p>
                                <p className="text-[10px] text-muted-foreground">Certified SeniorBarman host</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-sm">
                            <Ticket className="text-orange-500 h-5 w-5 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-foreground">Instant Delivery</p>
                                <p className="text-[10px] text-muted-foreground">Digital ticket to email & SMS</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-sm">
                            <CheckCircle2 className="text-blue-500 h-5 w-5 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-foreground">Fast Check-In</p>
                                <p className="text-[10px] text-muted-foreground">Scannable QR at venue gate</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Booking/Application Card */}
                <div className="lg:col-span-4">
                    <div className="sticky top-8 space-y-6">
                        <div className="bg-card border border-border dark:border-zinc-800 rounded-sm overflow-hidden shadow-lg">
                            {/* Card Accent Top Bar */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-purple-600" />
                            
                            <div className="p-6 sm:p-7 space-y-6">
                                {event.requiresApplication ? (
                                    <>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Registration</h3>
                                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-xs bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                    Application Portal
                                                </span>
                                            </div>
                                            <div className="flex items-baseline justify-between pt-1">
                                                <p className="text-xs text-muted-foreground font-medium">Application Fee</p>
                                                <p className="text-2xl font-black text-foreground">
                                                    {event.applicationFee > 0 ? `₦${Number(event.applicationFee).toLocaleString()}` : "FREE"}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {!applicationStatus || (applicationStatus.status !== 'approved' && applicationStatus.status !== 'rejected') ? (
                                            <Button 
                                                onClick={handleApplyClick}
                                                className="w-full h-12 rounded-sm bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
                                            >
                                                {applicationStatus ? "VIEW APPLICATION STATUS" : "START APPLICATION NOW"}
                                            </Button>
                                        ) : applicationStatus.status === 'approved' ? (
                                            <div className="space-y-4">
                                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold text-center">Your application was approved! You can now book tickets.</p>
                                                </div>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button className="w-full h-12 rounded-sm bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer">
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
                                        {/* Standard Ticket Booking */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Ticket Tiers</h3>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Selling Now</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2.5">
                                            {event.ticketTypes?.map((ticket: any, index: number) => (
                                                <div key={index} className="flex justify-between items-center p-3.5 bg-muted/40 dark:bg-zinc-800/40 rounded-sm border border-border dark:border-zinc-700 hover:border-orange-500/30 transition-colors">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{ticket.name}</p>
                                                        <p className="text-lg font-black text-foreground mt-0.5">
                                                            {ticket.price > 0 ? `₦${Number(ticket.price).toLocaleString()}` : 'FREE'}
                                                        </p>
                                                    </div>
                                                    <div className="h-8 w-8 rounded-sm bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                                        <Ticket size={16} className="text-orange-500" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="w-full h-12 rounded-sm bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer hover:shadow-orange-500/20">
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

                                {/* Share button right under booking action */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShareModalOpen(true)}
                                    className="w-full h-10 rounded-sm border-border bg-card hover:bg-muted text-foreground font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    <Share2 size={14} className="text-orange-500" />
                                    Share Direct Link
                                </Button>

                                <p className="text-[10px] text-muted-foreground text-center uppercase tracking-wider leading-relaxed pt-2 border-t border-border">
                                    Instant mobile delivery • Official SeniorBarman ticket
                                </p>
                            </div>

                            {/* Admin / Organizer Quick Link */}
                            {isAdmin && (
                                <Link
                                    href={`/u/a/events/${event._id}`}
                                    className="block p-3.5 bg-muted/20 border-t border-border hover:bg-muted/40 transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Trophy size={14} className="text-orange-500" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Admin Dashboard View</span>
                                        </div>
                                        <ArrowLeft size={13} className="text-muted-foreground rotate-180 group-hover:translate-x-1 group-hover:text-foreground transition-transform" />
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

export default function PublicEventDetailPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                <p className="text-lg font-medium">Loading activity...</p>
            </div>
        }>
            <PublicEventDetailContent />
        </Suspense>
    )
}

