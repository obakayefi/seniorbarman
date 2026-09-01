"use client"
import React, { useEffect, useState } from 'react'
import { DashboardLayoutWrapper } from '@/components/layout/DashboardLayoutWrapper'
import { useApp } from '@/context/AppContext'
import { sitemap } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { CalendarPlus, Users, ScanQrCode, ShieldCheck, ArrowRight, BarChart3, Search, Tickets, UsersRound, History, Sparkles, CalendarDays, Bug, Settings2 } from 'lucide-react'
import api from '@/lib/axios'
import { Spinner } from '@/components/ui/spinner'
import EnvViewer from '@/components/features/admin/EnvViewer'

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
        },
        {
            title: "Ticket Grant Wizard",
            description: "Directly grant tickets to users",
            icon: Sparkles,
            url: sitemap.admin.ticketGrantWizard,
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            title: "User Management",
            description: "Manage accounts and roles",
            icon: UsersRound,
            url: sitemap.admin.users,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Audit Logs",
            description: "Track all system activity",
            icon: History,
            url: sitemap.admin.auditLogs,
            color: "text-muted-foreground",
            bg: "bg-zinc-500/10"
        },
        {
            title: "Error Logs",
            description: "Monitor silent runtime faults",
            icon: Bug,
            url: sitemap.admin.errorLogs,
            color: "text-red-500",
            bg: "bg-red-500/10"
        },
        {
            title: "Search Ticket",
            description: "Find and manage any ticket by ID",
            icon: Search,
            url: sitemap.admin.ticketSearch,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10"
        },
        {
            title: "Manage Activities",
            description: "Edit or delete any past or future event",
            icon: CalendarDays,
            url: "/u/a/events/manage",
            color: "text-rose-500",
            bg: "bg-rose-500/10"
        },
        {
            title: "Ticket Orders",
            description: "View all ticket orders by user email",
            icon: Tickets,
            url: "/u/a/ticket-orders",
            color: "text-sky-500",
            bg: "bg-sky-500/10"
        },
        {
            title: "Configurations",
            description: "Manage global settings and UI overrides",
            icon: Settings2,
            url: "/u/a/configurations",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        }
    ]

    const filteredActions = adminActions.filter(action => {
        if (user?.role === 'organizer') {
            return ['Create Event', 'Scanner'].includes(action.title);
        }
        return true;
    });

    return (
        <DashboardLayoutWrapper 
            title={user?.role === 'organizer' ? "Organizer Hub" : "Admin Oversight"}
            headerAction={<EnvViewer />}
        >
            {/* Admin Stats Grid - Only show for full admins */}
            {user?.role !== 'organizer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-card text-card-foreground border border-border p-6 rounded-sm shadow-sm flex items-center gap-6">
                        <div className="p-4 bg-orange-500/10 rounded-sm">
                            <BarChart3 className="text-orange-500" size={32} />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Total Events</p>
                            <h3 className="text-3xl font-black text-foreground">{isLoading ? <Spinner /> : stats.totalEvents}</h3>
                        </div>
                    </div>

                    <div className="bg-card text-card-foreground border border-border p-6 rounded-sm shadow-sm flex items-center gap-6">
                        <div className="p-4 bg-blue-500/10 rounded-sm">
                            <Users className="text-blue-500" size={32} />
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Total Accounts</p>
                            <h3 className="text-3xl font-black text-foreground">{isLoading ? <Spinner /> : stats.totalUsers}</h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions Section */}
            <div className="space-y-6">
                <h2 className="text-xl font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                    {user?.role === 'organizer' ? "Quick Actions" : "Management Tools"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredActions.map((action) => (
                        <button
                            key={action.title}
                            onClick={() => router.push(action.url)}
                            className="bg-card hover:bg-muted/50 text-card-foreground border border-border hover:border-orange-500/40 p-6 rounded-sm text-left transition-all duration-300 group flex items-center justify-between shadow-sm cursor-pointer"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`p-4 ${action.bg} rounded-sm group-hover:scale-110 transition-transform duration-500`}>
                                    <action.icon className={action.color} size={28} />
                                </div>
                                <div>
                                    <h4 className="text-foreground font-black text-lg">{action.title}</h4>
                                    <p className="text-muted-foreground text-sm">{action.description}</p>
                                </div>
                            </div>
                            <ArrowRight className="text-muted-foreground group-hover:text-orange-500 group-hover:translate-x-2 transition-all duration-300" />
                        </button>
                    ))}
                </div>
            </div>
        </DashboardLayoutWrapper>
    )
}

export default AdminDashboard
