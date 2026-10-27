"use client"
import React, { useEffect, useState } from 'react'
import { fetchErrorLogs, clearErrorLogs, ErrorLogEntry } from '@/services/errorActions'
import { AlertCircle, Bug, ChevronDown, ChevronRight, RefreshCw, Trash2, Clock, HardDrive, TerminalSquare } from 'lucide-react'
import { toast } from 'sonner'

export default function ErrorDashboard() {
    const [logs, setLogs] = useState<ErrorLogEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
    
    const loadLogs = async () => {
        setLoading(true)
        const entries = await fetchErrorLogs()
        setLogs(entries)
        setLoading(false)
    }

    useEffect(() => {
        loadLogs()
    }, [])

    const handleClear = async () => {
        if (!confirm("Are you sure you want to permanently clear all silent error logs?")) return;
        const success = await clearErrorLogs();
        if (success) {
            toast.success("Error logs wiped successfully.");
            setLogs([]);
        } else {
            toast.error("Failed to wipe local log file.");
        }
    }

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6 sm:p-12 font-sans selection:bg-red-500/30">
            {/* Minimalist Dashboard Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-black flex items-center gap-4 tracking-tighter uppercase">
                        SYSTEM <span className="text-red-500">AUDIT</span> 
                        <Bug size={40} className="text-red-500 animate-pulse" />
                    </h1>
                    <p className="text-muted-foreground font-medium tracking-wide mt-2 uppercase text-sm">
                        Silent Runtime Exceptions & Service Monitoring
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={loadLogs}
                        disabled={loading}
                        className="bg-mutedhover:bg-muted border border-border flex-1 lg:flex-none text-foreground font-bold px-6 py-4 rounded-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin text-foreground" : ""} />
                        <span className="tracking-wide">Refresh Logs</span>
                    </button>
                    <button
                        onClick={handleClear}
                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex-1 lg:flex-none text-red-500 font-bold px-6 py-4 rounded-sm flex items-center justify-center gap-3 transition-all"
                    >
                        <Trash2 size={18} />
                        <span className="tracking-wide">Wipe Logfile</span>
                    </button>
                </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="max-w-7xl mx-auto space-y-6">
                {loading ? (
                    <div className="bg-card border border-border rounded-sm p-16 text-center text-muted-foreground/70 flex flex-col items-center gap-5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
                        <RefreshCw size={36} className="animate-spin text-red-500/30" />
                        <p className="font-extrabold tracking-[0.2em] uppercase text-xs">Analyzing Filesystem Vectors...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="bg-card border border-border rounded-sm p-20 text-center text-muted-foreground/70 flex flex-col items-center gap-6 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
                        <div className="p-8 bg-green-500/5 rounded-full border border-green-500/10">
                            <AlertCircle size={56} className="text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">Zero Exceptions Detected</h3>
                            <p className="text-muted-foreground font-medium">The local markdown stream is completely clean. System is healthy.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {logs.map((log) => {
                            const isExpanded = expandedIds.has(log.id)
                            const date = new Date(log.timestamp)
                            
                            return (
                                <div key={log.id} className="bg-muted/40 backdrop-blur-xl border border-border rounded-sm overflow-hidden shadow-xl hover:border-red-500/20 transition-all duration-300">
                                    <div 
                                        className="p-6 sm:p-8 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
                                        onClick={() => toggleExpand(log.id)}
                                    >
                                        <div className="flex items-start gap-5 w-full">
                                            <div className="mt-1 p-3 bg-red-500/10 rounded-sm shrink-0 border border-red-500/10">
                                                <TerminalSquare size={22} className="text-red-500" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
                                                    {log.title}
                                                </h3>
                                                <p className="text-muted-foreground mt-2 font-medium leading-relaxed">
                                                    {log.message}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 w-full md:w-auto border-t md:border-t-0 border-border pt-6 md:pt-0">
                                            <div className="flex flex-col gap-2 items-start md:items-end text-xs font-bold text-muted-foreground tracking-widest uppercase">
                                                <span className="flex items-center gap-2"><HardDrive size={14} className="text-muted-foreground/70"/>{log.component}</span>
                                                <span className="flex items-center gap-2"><Clock size={14} className="text-red-500/50"/>{date.toLocaleString()}</span>
                                            </div>
                                            <button className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all bg-muted/40 p-3 rounded-sm">
                                                {isExpanded ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expandable Stack Trace Area */}
                                    <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden">
                                            {log.stackTrace ? (
                                                <div className="bg-background/60 m-6 sm:m-8 mt-0 p-6 rounded-sm border border-red-500/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-xs font-black uppercase text-red-500 tracking-widest flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse border border-red-400"></div>
                                                            Execution Reference
                                                        </h4>
                                                    </div>
                                                    <pre className="text-[13px] text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                                                        {log.stackTrace}
                                                    </pre>
                                                </div>
                                            ) : (
                                                <div className="m-6 sm:m-8 mt-0 p-6 border border-border/50 border-dashed rounded-sm bg-card/50 text-center">
                                                    <span className="text-sm font-bold tracking-wide uppercase text-muted-foreground/70 italic">No stack trace captured by logger</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
