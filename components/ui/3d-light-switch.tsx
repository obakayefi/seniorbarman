"use client";

import React, { useState } from "react";
import { Power, Lock, AlertCircle, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ThreeDLightSwitchProps {
    eventId: string;
    isEnded: boolean;
    eventDate: string | Date;
    onToggleSuccess?: (newIsEnded: boolean) => void;
}

export function ThreeDLightSwitch({
    eventId,
    isEnded: initialIsEnded,
    eventDate,
    onToggleSuccess
}: ThreeDLightSwitchProps) {
    const [isEnded, setIsEnded] = useState(initialIsEnded);
    const [loading, setLoading] = useState(false);

    const now = new Date();
    const eventTime = new Date(eventDate);
    const hasStarted = now >= eventTime;

    const handleToggle = async () => {
        if (!hasStarted) {
            toast.error("Event has not started yet. Sales cannot be manually ended before start time.");
            return;
        }

        const nextState = !isEnded;
        const confirmMsg = nextState
            ? "Are you sure you want to END this event? This will immediately remove it from the homepage and suspend ticket sales."
            : "Are you sure you want to RE-ACTIVATE sales for this event?";

        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        try {
            const res = await api.post(`/events/${eventId}/toggle-end`, { isEnded: nextState });
            if (res.data.success) {
                setIsEnded(res.data.isEnded);
                toast.success(res.data.message);
                if (onToggleSuccess) {
                    onToggleSuccess(res.data.isEnded);
                }
            }
        } catch (error: any) {
            console.error("Failed to toggle event state:", error);
            toast.error(error.response?.data?.error || "Failed to update event state");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:px-4 sm:py-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800 shadow-md backdrop-blur-md w-full sm:w-auto min-w-[260px] max-w-full transition-all">
                {/* Left info / status */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-300 ${
                            !hasStarted
                                ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                : isEnded
                                    ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)] animate-pulse"
                                    : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                        }`} />
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 leading-none">
                                Sales Control
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium leading-tight mt-0.5">
                                {!hasStarted ? "Pre-event locked" : isEnded ? "Sales ended & hidden" : "Live & accepting orders"}
                            </span>
                        </div>
                    </div>

                    {!hasStarted && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="flex sm:hidden items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                                    <Lock size={10} className="text-amber-400" />
                                </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-zinc-900 border-zinc-700 text-zinc-200 text-xs">
                                Activates when event date arrives.
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>

                {/* Practical Rocker Switch Button */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button
                        type="button"
                        disabled={!hasStarted || loading}
                        onClick={handleToggle}
                        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-wider transition-all select-none shadow-sm ${
                            !hasStarted
                                ? "opacity-60 cursor-not-allowed bg-zinc-900 border-zinc-800 text-zinc-500"
                                : loading
                                    ? "cursor-wait opacity-80 bg-zinc-900 border-zinc-700 text-zinc-400"
                                    : isEnded
                                        ? "bg-gradient-to-r from-red-950/60 to-zinc-900 border-red-500/40 text-red-400 hover:bg-red-900/30 active:scale-95 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                                        : "bg-gradient-to-r from-emerald-950/60 to-zinc-900 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/30 active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={13} className="animate-spin text-orange-500" />
                                <span>Updating...</span>
                            </>
                        ) : !hasStarted ? (
                            <>
                                <Lock size={13} className="text-amber-400" />
                                <span>Locked</span>
                            </>
                        ) : isEnded ? (
                            <>
                                <Power size={13} className="text-red-500" />
                                <span>Ended (Turn ON)</span>
                            </>
                        ) : (
                            <>
                                <Power size={13} className="text-emerald-400" />
                                <span>Active (Turn OFF)</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </TooltipProvider>
    );
}
