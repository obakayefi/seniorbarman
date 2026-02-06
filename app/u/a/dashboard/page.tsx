"use client"
import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { useApp } from '@/context/AppContext'
import { sitemap } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { CalendarPlus, Users, ScanQrCode, ShieldCheck, ArrowRight, BarChart3 } from 'lucide-react'
import api from '@/lib/axios'
import { Spinner } from '@/components/ui/spinner'

const AdminDashboard = () => {
    const { user } = useApp()
    const router = useRouter()
    const [stats, setStats] = useState({ totalEvents: 0, totalUsers: 0 })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const [eventsRes, usersRes] = await Promise.all([
                    api.get('/events'),
                    api.get('/users')
                ])
                setStats({
                    totalEvents: eventsRes.data.events?.length || 0,
                    totalUsers: usersRes.data.users?.length || 0
                })
            } catch (error) {
                console.error("Error fetching admin stats", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchAdminStats()
    }, [])

    const adminActions = [
        {
            title: "Create Event",
            description: "Launch a new match or special event",
            icon: CalendarPlus,
            url: sitemap.admin.createEvent,
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            title: "Scanner",
            description: "Check-in attendees at the gate",
            icon: ScanQrCode,
            url: sitemap.bouncer.scanner,
            color: "text-green-500",
            bg: "bg-green-500/10"
        },
        {
            title: "Manage Staff",
            description: "Create and manage system admins",
            icon: ShieldCheck,
            url: sitemap.admin.createAdmin,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        }
    ]

    return (
        <div className='md:p-10 p-6 w-full space-y-10'>
            <PageHeader title="Admin Oversight" />

            {/* Admin Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl shadow-xl flex items-center gap-6">
                    <div className="p-4 bg-orange-500/10 rounded-xl">
                        <BarChart3 className="text-orange-500" size={32} />
                    </div>
                    <div>
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Total Events</p>
                        <h3 className="text-3xl font-black text-white">{isLoading ? <Spinner /> : stats.totalEvents}</h3>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-white/5 p-6 rounded-2xl shadow-xl flex items-center gap-6">
                    <div className="p-4 bg-blue-500/10 rounded-xl">
                        <Users className="text-blue-500" size={32} />
                    </div>
                    <div>
                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Total Accounts</p>
                        <h3 className="text-3xl font-black text-white">{isLoading ? <Spinner /> : stats.totalUsers}</h3>
                    </div>
                </div>
            </div>

            {/* Quick Actions Section */}
            <div className="space-y-6">
                <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                    Management Tools
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adminActions.map((action) => (
                        <button
                            key={action.title}
                            onClick={() => router.push(action.url)}
                            className="bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 hover:border-orange-500/30 p-6 rounded-2xl text-left transition-all duration-300 group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`p-4 ${action.bg} rounded-xl group-hover:scale-110 transition-transform duration-500`}>
                                    <action.icon className={action.color} size={28} />
                                </div>
                                <div>
                                    <h4 className="text-white font-black text-lg">{action.title}</h4>
                                    <p className="text-zinc-500 text-sm">{action.description}</p>
                                </div>
                            </div>
                            <ArrowRight className="text-zinc-700 group-hover:text-orange-500 group-hover:translate-x-2 transition-all duration-300" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
