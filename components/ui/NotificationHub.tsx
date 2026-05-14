"use client"
import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle2, AlertCircle, Info, ExternalLink, Loader2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { toast } from 'sonner'
import api from '@/lib/axios'

export default function NotificationHub() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const res = await api.get('/notifications')
            if (res.data.notifications) {
                setNotifications(res.data.notifications)
                setUnreadCount(res.data.notifications.filter((n: any) => !n.isRead).length)
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    const markAsRead = async (id?: string) => {
        try {
            await api.patch('/notifications', { 
                notificationId: id, 
                markAllAsRead: !id 
            })
            if (!id) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
                setUnreadCount(0)
            } else {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
        } catch (error) {
            toast.error("Failed to update notification")
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'payment': return <CheckCircle2 size={16} className="text-green-500" />;
            case 'application_update': return <Info size={16} className="text-blue-500" />;
            case 'alert': return <AlertCircle size={16} className="text-red-500" />;
            default: return <Bell size={16} className="text-zinc-500" />;
        }
    }

    return (
        <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 p-0 rounded-full hover:bg-zinc-800 transition-colors">
                    <Bell size={20} className={unreadCount > 0 ? "text-orange-500 animate-pulse" : "text-zinc-400"} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-4 w-4 bg-orange-600 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-black">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-zinc-950 border-zinc-800 text-white p-0 shadow-2xl rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-zinc-500">Notifications</h3>
                    {unreadCount > 0 && (
                        <button 
                            onClick={() => markAsRead()} 
                            className="text-[10px] font-bold text-orange-500 hover:text-white transition-colors uppercase tracking-tighter"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {loading && notifications.length === 0 ? (
                        <div className="p-10 flex flex-col items-center gap-2 text-zinc-600">
                            <Loader2 size={24} className="animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Checking alerts...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-10 text-center space-y-2">
                            <div className="h-12 w-12 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
                                <Bell size={24} className="text-zinc-700" />
                            </div>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-tight">All caught up!</p>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest leading-relaxed">Your notification center is clear</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div 
                                key={n._id} 
                                className={`group p-4 border-b border-zinc-900/50 hover:bg-white/[0.02] transition-all relative ${!n.isRead ? 'bg-orange-500/5' : ''}`}
                                onClick={() => !n.isRead && markAsRead(n._id)}
                            >
                                <div className="flex gap-3">
                                    <div className="mt-1 shrink-0">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-xs font-black truncate ${!n.isRead ? 'text-white' : 'text-zinc-400'}`}>
                                                {n.title}
                                            </p>
                                            <span className="text-[9px] text-zinc-600 font-bold shrink-0">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">
                                            {n.message}
                                        </p>
                                        

                                    </div>
                                    {!n.isRead && (
                                        <div className="absolute top-4 right-2 h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                <div className="p-3 bg-zinc-900/30 text-center">
                    <button className="text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors">
                        View All Activity History
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
