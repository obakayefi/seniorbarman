"use client"
import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { useApp } from '@/context/AppContext'
import { sitemap } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { CalendarDays, Trophy, TrendingUp, ArrowRight, History } from 'lucide-react'
import api from '@/lib/axios'
import { Spinner } from '@/components/ui/spinner'

const TeamManagerDashboard = () => {
  const { user } = useApp()
  const router = useRouter()
  const [stats, setStats] = useState({ 
    totalEvents: 0, 
    upcomingEvents: 0, 
    pastEvents: 0, 
    eventsThisMonth: 0,
    recentEvents: [] as any[]
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/team_manager/stats')
        if (res.data.success) {
            setStats(res.data.stats)
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [user])

  const quickLinks = [
    {
      title: "Scanner",
      description: "Scan tickets at the gate",
      icon: Trophy,
      url: sitemap.bouncer.scanner,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Upcoming Events",
      description: "View scheduled matches and events",
      icon: CalendarDays,
      url: sitemap.user.eventsTicketPurchase,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    }
  ]

  return (
    <div className='md:p-10 p-6 w-full space-y-10'>
      <PageHeader title={`Team Manager Dashboard`} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 rounded-xl">
            <Trophy className="text-emerald-500" size={32} />
          </div>
          <div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Total Matches</p>
            <h3 className="text-3xl font-black text-white">{isLoading ? <Spinner /> : stats.totalEvents}</h3>
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl flex items-center gap-6">
          <div className="p-4 bg-blue-500/10 rounded-xl">
            <TrendingUp className="text-blue-500" size={32} />
          </div>
          <div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Upcoming</p>
            <h3 className="text-3xl font-black text-white">{isLoading ? <Spinner /> : stats.upcomingEvents}</h3>
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl flex items-center gap-6">
          <div className="p-4 bg-orange-500/10 rounded-xl">
            <History className="text-orange-500" size={32} />
          </div>
          <div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Past Events</p>
            <h3 className="text-3xl font-black text-white">{isLoading ? <Spinner /> : stats.pastEvents}</h3>
          </div>
        </div>
        
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl flex items-center gap-6">
          <div className="p-4 bg-purple-500/10 rounded-xl">
            <CalendarDays className="text-purple-500" size={32} />
          </div>
          <div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">This Month</p>
            <h3 className="text-3xl font-black text-white">{isLoading ? <Spinner /> : stats.eventsThisMonth}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Quick Links Section */}
        <div className="space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
            Quick Navigation
            </h2>
            <div className="grid grid-cols-1 gap-4">
            {quickLinks.map((link) => (
                <button
                key={link.title}
                onClick={() => router.push(link.url)}
                className="bg-zinc-900/20 hover:bg-zinc-900/50 border border-white/5 hover:border-emerald-500/30 p-6 rounded-2xl text-left transition-all duration-300 group flex items-center justify-between"
                >
                <div className="flex items-center gap-6">
                    <div className={`p-4 ${link.bg} rounded-xl group-hover:scale-110 transition-transform duration-500`}>
                    <link.icon className={link.color} size={28} />
                    </div>
                    <div>
                    <h4 className="text-white font-black text-lg">{link.title}</h4>
                    <p className="text-zinc-500 text-sm">{link.description}</p>
                    </div>
                </div>
                <ArrowRight className="text-zinc-700 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all duration-300" />
                </button>
            ))}
            </div>
        </div>

        {/* Recent Events Section */}
        <div className="space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
            Recent Matches
            </h2>
            <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-6">
                {isLoading ? (
                    <div className="flex justify-center p-4"><Spinner /></div>
                ) : stats.recentEvents.length === 0 ? (
                    <p className="text-zinc-500 text-center py-4">No recent matches found.</p>
                ) : (
                    <div className="space-y-4">
                        {stats.recentEvents.map((ev) => (
                            <div key={ev._id} className="flex justify-between items-center border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                                <div>
                                    <h4 className="text-white font-bold">{ev.title}</h4>
                                    <p className="text-zinc-500 text-sm">{ev.venue}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-mono text-zinc-400">{new Date(ev.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}

export default TeamManagerDashboard
