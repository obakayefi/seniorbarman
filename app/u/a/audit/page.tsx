"use client"
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { History, Loader2, Info } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"

const AuditPage = () => {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/admin/audit')
                setLogs(res.data.logs || [])
            } catch (error) {
                toast.error("Failed to fetch audit logs")
            } finally {
                setLoading(false)
            }
        }
        fetchLogs()
    }, [])

    const getActionColor = (action: string) => {
        if (action.includes('CREATE')) return 'bg-green-500/10 text-green-500'
        if (action.includes('DELETE')) return 'bg-red-500/10 text-red-500'
        if (action.includes('CHANGE') || action.includes('UPDATE')) return 'bg-orange-500/10 text-orange-500'
        if (action.includes('GRANT')) return 'bg-purple-500/10 text-purple-500'
        if (action.includes('LOGIN')) return 'bg-blue-500/10 text-blue-400'
        if (action.includes('APPROVE')) return 'bg-emerald-500/10 text-emerald-400'
        if (action.includes('REJECT')) return 'bg-red-500/10 text-red-400'
        return 'bg-zinc-500/10 text-zinc-500'
    }

    const formatDetails = (action: string, details: any): string => {
        if (!details) return 'No details recorded'
        try {
            switch (action) {
                case 'USER_LOGIN':
                    return `Signed in successfully — IP: ${details.ip || 'unknown'} · Role: ${details.role || '?'}`
                case 'UPDATE_USER_ROLE':
                    return `Changed role of ${details.userEmail || 'user'} from "${details.oldRole || '?'}" → "${details.newRole || '?'}"${details.teamId ? ' · assigned to a team' : ''}`
                case 'APPROVE_PROVIDER_REQUEST':
                    return `Approved ${details.email || 'user'} as ${(details.role || '').replace(/_/g, ' ')}${details.teamId ? ' · assigned to a team' : ''}`
                case 'REJECT_PROVIDER_REQUEST':
                    return `Rejected ${details.email || 'user'} (${(details.role || '').replace(/_/g, ' ')})${details.reason ? ` — Reason: ${details.reason}` : ''}`
                case 'CREATE_EVENT':
                    return `Created event "${details.title || 'Untitled'}" at ${details.venue || 'unknown venue'}`
                case 'UPDATE_EVENT':
                    return `Updated event "${details.title || 'Untitled'}"`
                case 'DELETE_EVENT':
                    return `Deleted event "${details.title || 'Untitled'}"`
                default:
                    if (typeof details === 'object') {
                        return Object.entries(details)
                            .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
                            .join(' · ')
                    }
                    return String(details)
            }
        } catch {
            return JSON.stringify(details)
        }
    }

    return (
        <div className="p-6 space-y-6 bg-black min-h-screen text-white">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                    <History className="text-orange-500" /> Audit Logs
                </h1>
                <p className="text-zinc-500">Track all administrative actions and system changes</p>
            </header>

            <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader className="border-b border-zinc-900">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400">System Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                            <p className="text-zinc-500 animate-pulse">Loading system logs...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-zinc-900/30">
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Timestamp</TableHead>
                                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Administrator</TableHead>
                                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Action</TableHead>
                                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Target</TableHead>
                                    <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-zinc-600 italic">
                                            No audit logs found
                                        </TableCell>
                                    </TableRow>
                                ) : logs.map((log) => (
                                    <TableRow key={log._id} className="border-zinc-800 hover:bg-zinc-900/20 transition-colors">
                                        <TableCell className="text-zinc-500 text-[11px] font-mono whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white text-sm">
                                                    {log.adminId?.firstName} {log.adminId?.lastName}
                                                </span>
                                                <span className="text-[10px] text-zinc-500">{log.adminId?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${getActionColor(log.action)} border-none text-[10px] font-black uppercase tracking-tighter px-2 py-0.5`}>
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-zinc-300 font-medium text-xs font-mono">{log.targetType}</span>
                                                <span className="text-[10px] text-zinc-600">{log.targetId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <div className="bg-zinc-900/50 p-2.5 rounded-md border border-zinc-800/50 flex items-start gap-2">
                                                <Info size={12} className="text-zinc-600 mt-0.5 flex-shrink-0" />
                                                <p className="text-[11px] text-zinc-300 leading-relaxed">
                                                    {formatDetails(log.action, log.details)}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default AuditPage
