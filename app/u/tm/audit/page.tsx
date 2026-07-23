"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { format, formatDistanceToNow } from "date-fns"
import {
    History,
    LogIn,
    Shield,
    CheckCircle,
    XCircle,
    CalendarPlus,
    CalendarCog,
    Trash2,
    Activity,
    RefreshCw,
    Filter,
    ChevronDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AuditLog {
    _id: string
    adminId: {
        _id: string
        firstName: string
        lastName: string
        email: string
        role: string
    }
    action: string
    targetType: string
    targetId: string
    details: Record<string, any>
    createdAt: string
}

const ACTION_META: Record<string, {
    label: string
    icon: React.ReactNode
    bg: string
    text: string
    border: string
}> = {
    USER_LOGIN: {
        label: "Login",
        icon: <LogIn size={14} />,
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/20",
    },
    UPDATE_USER_ROLE: {
        label: "Role Change",
        icon: <Shield size={14} />,
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        border: "border-orange-500/20",
    },
    APPROVE_PROVIDER_REQUEST: {
        label: "Approval",
        icon: <CheckCircle size={14} />,
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
    },
    REJECT_PROVIDER_REQUEST: {
        label: "Rejection",
        icon: <XCircle size={14} />,
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/20",
    },
    CREATE_EVENT: {
        label: "Event Created",
        icon: <CalendarPlus size={14} />,
        bg: "bg-green-500/10",
        text: "text-green-400",
        border: "border-green-500/20",
    },
    UPDATE_EVENT: {
        label: "Event Updated",
        icon: <CalendarCog size={14} />,
        bg: "bg-yellow-500/10",
        text: "text-yellow-400",
        border: "border-yellow-500/20",
    },
    DELETE_EVENT: {
        label: "Event Deleted",
        icon: <Trash2 size={14} />,
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/20",
    },
}

const getActionMeta = (action: string) =>
    ACTION_META[action] ?? {
        label: action.replace(/_/g, " "),
        icon: <Activity size={14} />,
        bg: "bg-zinc-500/10",
        text: "text-zinc-400",
        border: "border-zinc-500/20",
    }

const formatDetails = (action: string, details: any): string => {
    if (!details) return "No details recorded"
    try {
        switch (action) {
            case "USER_LOGIN":
                return `Signed in · IP: ${details.ip || "unknown"} · Role: ${details.role || "?"}`
            case "UPDATE_USER_ROLE":
                return `Changed role of ${details.userEmail || "user"} from "${details.oldRole || "?"}" → "${details.newRole || "?"}"`
            case "APPROVE_PROVIDER_REQUEST":
                return `Approved ${details.email || "user"} as ${(details.role || "").replace(/_/g, " ")}${details.teamId ? " · assigned to a team" : ""}`
            case "REJECT_PROVIDER_REQUEST":
                return `Rejected ${details.email || "user"} (${(details.role || "").replace(/_/g, " ")})${details.reason ? ` — Reason: ${details.reason}` : ""}`
            case "CREATE_EVENT":
                return `Created event "${details.title || "Untitled"}" at ${details.venue || "unknown venue"}`
            case "UPDATE_EVENT":
                return `Updated event "${details.title || "Untitled"}"`
            case "DELETE_EVENT":
                return `Deleted event "${details.title || "Untitled"}"`
            default:
                if (typeof details === "object") {
                    return Object.entries(details)
                        .map(([k, v]) => `${k.replace(/_/g, " ")}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
                        .join(" · ")
                }
                return String(details)
        }
    } catch {
        return JSON.stringify(details)
    }
}

const getInitials = (firstName: string, lastName: string) =>
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase()

const FILTER_OPTIONS = ["All", "USER_LOGIN", "CREATE_EVENT", "UPDATE_EVENT", "DELETE_EVENT", "UPDATE_USER_ROLE", "APPROVE_PROVIDER_REQUEST", "REJECT_PROVIDER_REQUEST"]

export default function TeamManagerAuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState("All")
    const [refreshing, setRefreshing] = useState(false)

    const fetchLogs = async (showRefreshing = false) => {
        if (showRefreshing) setRefreshing(true)
        else setLoading(true)
        setError(null)
        try {
            const { data } = await axios.get("/api/team_manager/audit-logs")
            setLogs(data.logs || [])
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load activity logs")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    const filtered = filter === "All" ? logs : logs.filter(l => l.action === filter)

    return (
        <div className="min-h-screen bg-black text-white p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <History size={18} className="text-indigo-400" />
                        </div>
                        <h1 className="text-xl font-semibold text-white tracking-tight">Team Manager Activity</h1>
                    </div>
                    <p className="text-sm text-zinc-500 pl-10">
                        A complete audit trail of actions taken by all team managers.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 gap-1.5">
                                <Filter size={13} />
                                {filter === "All" ? "All Events" : getActionMeta(filter).label}
                                <ChevronDown size={13} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200 min-w-[180px]">
                            {FILTER_OPTIONS.map(opt => (
                                <DropdownMenuItem
                                    key={opt}
                                    onClick={() => setFilter(opt)}
                                    className={`text-sm cursor-pointer hover:bg-zinc-800 ${filter === opt ? "text-white font-medium" : "text-zinc-400"}`}
                                >
                                    {opt === "All" ? "All Events" : getActionMeta(opt).label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Refresh */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchLogs(true)}
                        disabled={refreshing}
                        className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 gap-1.5"
                    >
                        <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            {!loading && !error && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Total Actions", value: logs.length, color: "text-white" },
                        { label: "Logins", value: logs.filter(l => l.action === "USER_LOGIN").length, color: "text-blue-400" },
                        { label: "Events Created", value: logs.filter(l => l.action === "CREATE_EVENT").length, color: "text-green-400" },
                        { label: "Deletions", value: logs.filter(l => l.action === "DELETE_EVENT").length, color: "text-red-400" },
                    ].map(stat => (
                        <div key={stat.label} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4">
                            <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Timeline */}
            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-zinc-900/40 rounded-xl border border-zinc-800/40">
                            <Skeleton className="h-9 w-9 rounded-full bg-zinc-800" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-48 bg-zinc-800" />
                                <Skeleton className="h-3 w-72 bg-zinc-800/70" />
                                <Skeleton className="h-3 w-32 bg-zinc-800/50" />
                            </div>
                        </div>
                    ))
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                        <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
                            <XCircle size={22} className="text-red-400" />
                        </div>
                        <p className="text-sm text-zinc-400">{error}</p>
                        <Button size="sm" variant="outline" onClick={() => fetchLogs()} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                            Try Again
                        </Button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                        <div className="p-3 rounded-full bg-zinc-800 border border-zinc-700">
                            <Activity size={22} className="text-zinc-500" />
                        </div>
                        <p className="text-sm text-zinc-500">No activity logs found{filter !== "All" ? ` for "${getActionMeta(filter).label}"` : ""}.</p>
                    </div>
                ) : (
                    filtered.map((log, idx) => {
                        const meta = getActionMeta(log.action)
                        const actor = log.adminId
                        const initials = actor ? getInitials(actor.firstName, actor.lastName) : "??"
                        const name = actor ? `${actor.firstName} ${actor.lastName}` : "Unknown Manager"
                        const email = actor?.email ?? ""
                        const relativeTime = formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })
                        const exactTime = format(new Date(log.createdAt), "MMM d, yyyy · h:mm a")

                        return (
                            <div
                                key={log._id}
                                className="group flex gap-4 p-4 bg-zinc-900/40 hover:bg-zinc-900/70 rounded-xl border border-zinc-800/40 hover:border-zinc-700/60 transition-all duration-200"
                            >
                                {/* Avatar */}
                                <Avatar className="h-9 w-9 flex-shrink-0 ring-1 ring-zinc-700">
                                    <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs font-semibold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="text-sm font-medium text-white truncate">{name}</span>
                                        <span className="text-xs text-zinc-600 hidden sm:inline truncate">{email}</span>
                                        <Badge className={`text-[10px] font-medium px-2 py-0 h-5 border ${meta.bg} ${meta.text} ${meta.border} flex items-center gap-1`}>
                                            {meta.icon}
                                            {meta.label}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                        {formatDetails(log.action, log.details)}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[11px] text-zinc-600">{relativeTime}</span>
                                        <span className="text-[10px] text-zinc-700">{exactTime}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
