"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell, Check, Clock, Info, AlertTriangle, XCircle, ChevronRight, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get("/api/notifications");
            setNotifications(data.notifications);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await axios.patch(`/api/notifications/${id}`, { isRead: true });
            setNotifications(prev => 
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "success": return <Check className="text-green-500" size={20} />;
            case "warning": return <AlertTriangle className="text-orange-500" size={20} />;
            case "error": return <XCircle className="text-red-500" size={20} />;
            default: return <Info className="text-blue-500" size={20} />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Spinner className="text-orange-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-zinc-900 rounded-2xl border border-white/5">
                        <Bell className="text-orange-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Notifications</h1>
                        <p className="text-zinc-500 text-sm">Stay updated with your applications and events.</p>
                    </div>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button 
                        onClick={() => {/* mark all as read logic */}}
                        className="text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-20 text-center flex flex-col items-center justify-center">
                    <div className="p-6 bg-zinc-900 rounded-full mb-6 border border-white/5">
                        <Inbox className="text-zinc-700" size={48} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No notifications yet</h3>
                    <p className="text-zinc-500 max-w-xs mx-auto">We'll notify you here when there's an update on your applications or tickets.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div 
                            key={notif._id}
                            onClick={() => !notif.isRead && markAsRead(notif._id)}
                            className={cn(
                                "group relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-3xl p-6 transition-all duration-300 hover:bg-zinc-900 hover:border-white/10",
                                !notif.isRead && "border-l-4 border-l-orange-500 bg-orange-500/5"
                            )}
                        >
                            <div className="flex gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 bg-zinc-950",
                                    !notif.isRead && "bg-zinc-900"
                                )}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className={cn(
                                            "font-bold text-white transition-colors group-hover:text-orange-500",
                                            !notif.isRead ? "text-lg" : "text-base"
                                        )}>
                                            {notif.title}
                                        </h3>
                                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter whitespace-nowrap flex items-center gap-1">
                                            <Clock size={10} />
                                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                        {notif.message}
                                    </p>
                                    
                                    {notif.link && (
                                        <Link 
                                            href={notif.link}
                                            className="inline-flex items-center gap-1 text-[10px] font-black text-white bg-zinc-800 hover:bg-orange-500 px-4 py-2 rounded-full transition-all uppercase tracking-widest group-hover:gap-2"
                                        >
                                            View Details
                                            <ChevronRight size={12} />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
