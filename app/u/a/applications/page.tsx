"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
    Loader2, ClipboardList, CheckCircle2, AlertCircle,
    Clock, Search, ExternalLink, Filter, Eye, Download
} from "lucide-react"
import { format } from 'date-fns'
import Link from 'next/link'
import api from '@/lib/axios'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function AdminApplicationsPage() {
    const router = useRouter()
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selectedApp, setSelectedApp] = useState<any>(null)
    const [rejectionModal, setRejectionModal] = useState<{ appId: string } | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    const fetchApplications = async () => {
        try {
            setLoading(true)
            const res = await api.get('/admin/applications')
            if (res.data.success) {
                setApplications(res.data.applications || [])
            }
        } catch (error) {
            toast.error("Failed to load applications")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchApplications()
    }, [])

    const handleUpdateApplicant = async (appId: string, status: string, reason?: string) => {
        // Need event ID for the PATCH endpoint: /api/events/:id/applicants/:appId
        const app = applications.find(a => a._id === appId)
        if (!app) return

        try {
            const res = await api.patch(`/events/${app.event._id}/applicants/${appId}`, { status, reason })
            if (res.data.success) {
                toast.success(`Application ${status} successfully`)
                setApplications(prev => prev.map(a => a._id === appId ? { ...a, status, rejectionReason: reason } : a))
            }
        } catch (error) {
            toast.error("Failed to update application status")
        }
    }

    const filteredApps = applications.filter(app => {
        const matchesSearch =
            (app.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (app.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (app.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (app.event?.title?.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = filterStatus === 'all' || app.status === filterStatus;

        return matchesSearch && matchesStatus;
    })

    const exportToCSV = () => {
        if (filteredApps.length === 0) return;

        const headers = ["Name", "Email", "Event", "Status", "Submitted At"];
        // Add dynamic headers from form fields if any exist in the first app
        const sampleApp = filteredApps.find(a => a.formAnswers && a.formAnswers.length > 0);
        const formHeaders = sampleApp ? sampleApp.formAnswers.map((a: any) => a.fieldLabel) : [];
        const allHeaders = [...headers, ...formHeaders];

        const rows = filteredApps.map(app => {
            const baseData = [
                `${app.user?.firstName} ${app.user?.lastName}`,
                app.user?.email,
                app.event?.title || (app.event?.homeTeam + " v " + app.event?.awayTeam),
                app.status,
                app.submittedAt ? format(new Date(app.submittedAt), 'yyyy-MM-dd') : 'N/A'
            ];

            const formData = formHeaders.map((header: string) => {
                const answerObj = app.formAnswers?.find((a: any) => a.fieldLabel === header);
                if (!answerObj) return "";
                return Array.isArray(answerObj.answer) ? answerObj.answer.join("; ") : answerObj.answer;
            });

            return [...baseData, ...formData].map(val => `"${val}"`).join(",");
        });

        const csvContent = [allHeaders.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `applications_export_${format(new Date(), 'yyyyMMdd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-card text-muted-foreground gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                <p className="font-medium">Loading system applications…</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-card text-foreground p-6 md:p-10 pb-24">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-10 w-10 rounded-sm bg-orange-500/10 flex items-center justify-center">
                                <ClipboardList size={22} className="text-orange-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-foreground">Event Applications</h1>
                                <p className="text-muted-foreground text-sm">Review and manage all applicants across the platform</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={exportToCSV}
                        variant="outline"
                        className="border-border bg-muted/50 hover:bg-muted text-foreground font-bold"
                    >
                        <Download size={16} className="mr-2" /> Export CSV
                    </Button>
                </div>

                {/* Filters & Search */}
                <Card className="bg-mutedborder-">
                    <CardHeader className="-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email or event..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-card border-border w-full"
                                />
                            </div>
                            <div className="flex bg-card rounded-md border border-border p-1 shrink-0">
                                {['all', 'completed', 'approved', 'rejected'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-3 py-1 text-xs rounded-sm transition-all capitalize ${filterStatus === status ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        {status === 'completed' ? 'Review' : status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-auto">
                        <Table>
                            <TableHeader className="bg-card/50">
                                <TableRow className="border-border">
                                    <TableHead className="text-muted-foreground">Applicant</TableHead>
                                    <TableHead className="text-muted-foreground">Event</TableHead>
                                    <TableHead className="text-muted-foreground">Date</TableHead>
                                    <TableHead className="text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredApps.map((app) => (
                                    <TableRow key={app._id} className="border-border hover:bg-muted/50 transition-colors group">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground">
                                                    {app.user?.firstName} {app.user?.lastName}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground lowercase">{app.user?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-foreground text-sm font-medium truncate max-w-[200px]">
                                                    {app.event?.title || (app.event?.homeTeam + " vs " + app.event?.awayTeam)}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                                                    {app.event?._id?.slice(-8)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-muted-foreground text-xs">
                                                {app.submittedAt ? format(new Date(app.submittedAt), 'MMM dd, yyyy') : '—'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`text-[9px] uppercase tracking-widest font-black border-none ${app.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                                app.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                                    app.status === 'completed' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-muted text-muted-foreground'
                                                }`}>
                                                {app.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="h-8 border-border bg-muted hover:bg-zinc-700 text-foreground font-bold text-[10px] uppercase tracking-widest rounded-sm transition-all duration-300"
                                            >
                                                <Link href={`/u/applications/${app._id}`}>
                                                    Review Submission
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredApps.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20 text-muted-foreground/70">
                                            No applications found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
