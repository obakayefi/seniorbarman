"use client"
import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { useApp } from '@/context/AppContext'
import { sitemap, formattedDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
    CalendarPlus,
    CalendarDays,
    TrendingUp,
    ArrowRight,
    CalendarCheck,
    CalendarClock,
    BarChart3,
    Tickets,
    MapPin,
    ScanQrCode
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

type RecentEvent = {
    _id: string
    title: string
    date: string
    ticketTypes: { name: string, price: number }[]
}

type OrganizerStats = {
    totalEvents: number
    upcomingEvents: number
    pastEvents: number
    eventsThisMonth: number
    recentEvents: RecentEvent[]
}

const OrganizerDashboard = () => {
    const { user } = useApp()
    const router = useRouter()
    const [stats, setStats] = useState<OrganizerStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/organizer/stats')
                const data = await res.json()
                if (data.success) {
                    setStats(data.stats)
                }
            } catch (error) {
                console.error("Error fetching organizer stats", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    const statCards = [
        {
            title: "Total Events",
            value: stats?.totalEvents ?? 0,
            icon: BarChart3,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            glow: "shadow-orange-500/5"
        },
        {
            title: "Upcoming",
            value: stats?.upcomingEvents ?? 0,
            icon: CalendarClock,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            glow: "shadow-emerald-500/5"
        },
        {
            title: "Completed",
            value: stats?.pastEvents ?? 0,
            icon: CalendarCheck,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            glow: "shadow-blue-500/5"
        },
        {
            title: "This Month",
            value: stats?.eventsThisMonth ?? 0,
            icon: CalendarDays,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
            glow: "shadow-violet-500/5"
        },
    ]

    const quickActions = [
        {
            title: "Create Event",
            description: "Launch a new regular event",
            icon: CalendarPlus,
            url: sitemap.organizer.createEvent,
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            title: "Browse Events",
            description: "Explore all upcoming events",
            icon: CalendarDays,
            url: sitemap.user.eventsTicketPurchase,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "My Events",
            description: "View and manage your events",
            icon: CalendarCheck,
            url: "/u/organizer/events/manage",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Scanner",
            description: "Check-in attendees at the gate",
            icon: ScanQrCode,
            url: sitemap.bouncer.scanner,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
    ]

    return (
        <div className='md:p-10 p-6 w-full space-y-10'>
            <PageHeader title={`Welcome, ${user?.firstName || 'Organizer'}!`}>
                <span className="text-xs uppercase tracking-widest text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full">
                    Organizer
                </span>
            </PageHeader>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {statCards.map((card) => (
                    <div
                        key={card.title}
                        className={`bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-5 md:p-6 rounded-2xl shadow-xl ${card.glow} transition-all duration-300 hover:border-white/10 hover:scale-[1.02]`}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2.5 ${card.bg} rounded-xl`}>
                                <card.icon className={card.color} size={20} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl md:text-3xl font-black text-white">
                                {isLoading ? <Spinner /> : card.value}
                            </h3>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                                {card.title}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
                <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                        <button
                            key={action.title}
                            onClick={() => router.push(action.url)}
                            className="bg-zinc-900/20 hover:bg-zinc-900/50 border border-white/5 hover:border-orange-500/30 p-6 rounded-2xl text-left transition-all duration-300 group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3.5 ${action.bg} rounded-xl group-hover:scale-110 transition-transform duration-500`}>
                                    <action.icon className={action.color} size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-base">{action.title}</h4>
                                    <p className="text-zinc-500 text-xs">{action.description}</p>
                                </div>
                            </div>
                            <ArrowRight className="text-zinc-700 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300" size={18} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Events */}
            <div className="space-y-6">
                <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                    Recent Events
                </h2>
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Spinner />
                    </div>
                ) : stats?.recentEvents && stats.recentEvents.length > 0 ? (
                    <div className="space-y-3">
                        {stats.recentEvents.map((event) => {
                            const eventDate = new Date(event.date)
                            const isPast = eventDate < new Date()

                            return (
                                <div
                                    key={event._id}
                                    className="bg-zinc-900/30 border border-white/5 hover:border-white/10 p-5 rounded-2xl transition-all duration-300 flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl ${isPast ? 'bg-zinc-800' : 'bg-orange-500/10'}`}>
                                            <span className={`text-lg font-black ${isPast ? 'text-zinc-500' : 'text-orange-500'}`}>
                                                {eventDate.getDate()}
                                            </span>
                                            <span className={`text-[10px] uppercase tracking-wider font-bold ${isPast ? 'text-zinc-600' : 'text-orange-500/70'}`}>
                                                {eventDate.toLocaleString('en-US', { month: 'short' })}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm">{event.title}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MapPin size={12} className="text-zinc-600" />
                                                <span className="text-zinc-500 text-xs">{event.venue || "No venue"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-white text-xs font-bold">₦{event.ticketTypes?.[0]?.price?.toLocaleString() || '0'}</p>
                                            <p className="text-zinc-600 text-[10px] uppercase">{event.ticketTypes?.[0]?.name || 'Regular'}</p>
                                        </div>
                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${isPast ? 'bg-zinc-800 text-zinc-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {isPast ? 'Past' : 'Active'}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-12 text-center">
                        <CalendarDays className="mx-auto text-zinc-700 mb-3" size={40} />
                        <p className="text-zinc-500 font-medium">No events yet</p>
                        <p className="text-zinc-600 text-sm mt-1">Create your first event to see it here</p>
                        <button
                            onClick={() => router.push(sitemap.organizer.createEvent)}
                            className="mt-4 text-orange-500 text-sm font-bold hover:text-orange-400 transition-colors"
                        >
                            Create Event →
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrganizerDashboard
