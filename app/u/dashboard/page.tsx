"use client"
import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { useApp } from '@/context/AppContext'
import { sitemap } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { CalendarDays, Tickets, TrendingUp, ArrowRight } from 'lucide-react'
import api from '@/lib/axios'
import { Spinner } from '@/components/ui/spinner'
import { MdOutlineStadium } from "react-icons/md";


const UserDashboard = () => {
  const { user } = useApp()
  const router = useRouter()
  const [stats, setStats] = useState({ tickets: 0, events: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ticketsRes, eventsRes] = await Promise.all([
          api.get('/tickets'),
          api.get('/events')
        ])
        setStats({
          tickets: ticketsRes.data.tickets?.length || 0,
          events: eventsRes.data.events?.length || 0
        })
      } catch (error) {
        console.error("Error fetching dashboard data", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const quickLinks = [
    {
      title: "My Tickets",
      description: "View and manage your active passes",
      icon: Tickets,
      url: sitemap.user.tickets,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      title: "Browse Events",
      description: "Explore upcoming matches and shows",
      icon: CalendarDays,
      url: sitemap.user.eventsTicketPurchase,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Ranger's Home Matches",
      description: "View upcoming Rangers home matches",
      icon: MdOutlineStadium,
      url: sitemap.user.rangersTicketPurchase,
      color: "text-red-500",
      bg: "bg-red-500/10"
    }
  ]

  return (
    <div className='md:p-10 p-6 w-full space-y-10'>
      <PageHeader title={`Welcome back, ${user?.firstName || 'User'}!`} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl flex items-center gap-6">
          <div className="p-4 bg-orange-500/10 rounded-xl">
            <Tickets className="text-orange-500" size={32} />
          </div>
          <div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Active Tickets</p>
            <h3 className="text-3xl font-black text-white">{isLoading ? <Spinner /> : stats.tickets}</h3>
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl flex items-center gap-6">
          <div className="p-4 bg-blue-500/10 rounded-xl">
            <TrendingUp className="text-blue-500" size={32} />
          </div>
          <div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Available Events</p>
            <h3 className="text-3xl font-black text-white">{isLoading ? <Spinner /> : stats.events}</h3>
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
          Quick Navigation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <button
              key={link.title}
              onClick={() => router.push(link.url)}
              className="bg-zinc-900/20 hover:bg-zinc-900/50 border border-white/5 hover:border-orange-500/30 p-6 rounded-2xl text-left transition-all duration-300 group flex items-center justify-between"
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
              <ArrowRight className="text-zinc-700 group-hover:text-orange-500 group-hover:translate-x-2 transition-all duration-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard