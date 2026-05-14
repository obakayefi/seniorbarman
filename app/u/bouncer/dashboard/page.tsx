"use client"
import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { useApp } from '@/context/AppContext'
import { sitemap } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { 
    QrCode, 
    UserCheck, 
    UserMinus, 
    TrendingUp, 
    ShieldCheck, 
    ChevronRight,
    Loader2
} from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'

const BouncerDashboard = () => {
    const { user } = useApp()
    const router = useRouter()
    const [stats, setStats] = useState({ scansToday: 0, entriesToday: 0, exitsToday: 0, totalScans: 0 })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/bouncer/stats')
                const data = await res.json()
                if (data.success) {
                    setStats(data.stats)
                }
            } catch (error) {
                console.error("Error fetching bouncer stats", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    const statCards = [
        {
            title: "Scans Today",
            value: stats.scansToday,
            icon: QrCode,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            title: "Check-ins",
            value: stats.entriesToday,
            icon: UserCheck,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            title: "Check-outs",
            value: stats.exitsToday,
            icon: UserMinus,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Life-time",
            value: stats.totalScans,
            icon: TrendingUp,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
        }
    ]

    return (
        <div className='md:p-10 p-6 w-full space-y-10 min-h-screen bg-black'>
            <PageHeader title={`Welcome back, ${user?.firstName || 'Chief'}!`}>
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                    <ShieldCheck size={14} className="text-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                        Authorized Security
                    </span>
                </div>
            </PageHeader>

            {/* Main Action Area */}
            <div className="max-w-4xl mx-auto">
                <div className="relative group overflow-hidden rounded-[2.5rem] border border-orange-500/20 shadow-[0_0_50px_-12px_rgba(249,115,22,0.2)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-orange-500/5 group-hover:opacity-100 transition-opacity duration-700 opacity-50" />
                    <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-zinc-900/40 backdrop-blur-3xl">
                        <div className="space-y-4 text-center md:text-left">
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                                Ready to <span className="text-orange-500">Secure</span> the Gate?
                            </h2>
                            <p className="text-zinc-500 text-sm md:text-base font-medium max-w-md">
                                Launch the high-speed scanner to verify tickets, manage entry flows, and track attendance in real-time.
                            </p>
                        </div>
                        <Button 
                            onClick={() => router.push(sitemap.bouncer.scanner)}
                            className="h-20 px-10 bg-orange-500 hover:bg-white text-white hover:text-black font-black text-xl rounded-2xl transition-all duration-500 group active:scale-95 shadow-[0_20px_40px_rgba(249,115,22,0.3)] hover:shadow-[0_20px_40px_rgba(255,255,255,0.2)]"
                        >
                            <QrCode size={32} className="mr-4 group-hover:rotate-12 transition-transform duration-500" />
                            OPEN SCANNER
                            <ChevronRight size={28} className="ml-2 group-hover:translate-x-2 transition-transform duration-500" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Personal Stats */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-zinc-800" />
                    <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Performance Overview</h3>
                    <div className="h-px flex-1 bg-zinc-800" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {statCards.map((card) => (
                        <div 
                            key={card.title}
                            className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-xl transition-all duration-300 hover:border-white/10"
                        >
                            <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center mb-6`}>
                                <card.icon className={card.color} size={24} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{card.title}</h4>
                                <h3 className="text-3xl font-black text-white">
                                    {isLoading ? <Loader2 className="animate-spin text-zinc-700" size={24} /> : card.value}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-2xl max-w-4xl mx-auto flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                    <ShieldCheck size={20} />
                </div>
                <div className="space-y-1">
                    <h4 className="text-white font-bold text-sm uppercase tracking-tight">Security Protocol</h4>
                    <p className="text-zinc-500 text-xs leading-relaxed">
                        Always select the correct event in the scanner menu before starting. Ensure adequate lighting for the QR codes to minimize scan latency. For manual checks, use the approval modal that appears after a scan.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default BouncerDashboard
