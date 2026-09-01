"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    Loader2, Ticket, Users, TrendingUp, CheckCircle,
    ArrowLeft, Edit, Calendar, MapPin, Search, Plus, Download,
    ClipboardList, Wallet, Layers
} from "lucide-react"
import api from "@/lib/axios"
import Link from 'next/link'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function EventDetailPage() {
    const params = useParams()
    const id = params.id as string

    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [attendeeSearch, setAttendeeSearch] = useState('')
    const [applicants, setApplicants] = useState<any[]>([])
    const [selectedAppForView, setSelectedAppForView] = useState<any>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await api.get(`/admin/events/${id}`)
            if (res.data.success) {
                setData(res.data)
                console.log({ res: res.data })
                // appStats.applications is now returned by the admin endpoint
                // so we only fall back to a separate fetch if needed
                if (res.data.event.requiresApplication && !res.data.appStats?.applications) {
                    const appRes = await api.get(`/events/${id}/applicants`)
                    console.log({ res_within: res.data })

                    setApplicants(appRes.data.applicants || [])
                } else if (res.data.appStats?.applications) {
                    setApplicants(res.data.appStats.applications)
                }
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load event details")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) fetchData()
    }, [id])

    const handleUpdateApplicant = async (appId: string, status: string, reason?: string) => {
        try {
            const res = await api.patch(`/events/${id}/applicants/${appId}`, { status, reason })
            if (res.data.success) {
                toast.success(`Application ${status} successfully`)
                setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status, rejectionReason: reason } : a))
            }
        } catch (error) {
            toast.error("Failed to update application status")
        }
    }

    const [rejectionModal, setRejectionModal] = useState<{ appId: string } | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    const exportApplicantsToCSV = () => {
        if (applicants.length === 0) return;

        const headers = ["Name", "Email", "Status", "Submitted At"];
        // Add dynamic headers from form fields
        const sampleApp = applicants.find(a => a.formAnswers && a.formAnswers.length > 0);
        const formHeaders = sampleApp ? sampleApp.formAnswers.map((a: any) => a.fieldLabel) : [];
        const allHeaders = [...headers, ...formHeaders];

        const rows = applicants.map(app => {
            const baseData = [
                `${app.user?.firstName} ${app.user?.lastName}`,
                app.user?.email,
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
        link.setAttribute("download", `applicants_${event.title || 'event'}_${format(new Date(), 'yyyyMMdd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-card text-muted-foreground gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                <p className="text-lg font-medium">Analyzing event data...</p>
            </div>
        )
    }

    if (!data?.event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-card text-muted-foreground gap-4">
                <p className="text-xl">Event not found</p>
                <Button asChild variant="outline">
                    <Link href="/u/a/events/manage">Back to Management</Link>
                </Button>
            </div>
        )
    }

    const { event, stats, tickets, appStats } = data
    const totalCombinedRevenue = (stats.totalRevenue || 0) + (appStats?.applicationRevenue || 0)
    const filteredTickets = tickets.filter((t: any) =>
        (t.holderName?.toLowerCase().includes(attendeeSearch.toLowerCase())) ||
        (t.createdBy?.firstName?.toLowerCase().includes(attendeeSearch.toLowerCase())) ||
        (t.createdBy?.lastName?.toLowerCase().includes(attendeeSearch.toLowerCase())) ||
        (t.createdBy?.email?.toLowerCase().includes(attendeeSearch.toLowerCase())) ||
        (t.ticketNumber?.toLowerCase().includes(attendeeSearch.toLowerCase()))
    )

    return (
        <div className="md:p-10 p-4 sm:p-6 w-full space-y-8 min-h-screen bg-background text-foreground pb-20">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                    <div className="space-y-4">
                        <Link href="/u/a/events/manage" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold uppercase tracking-wider group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Management
                        </Link>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-orange-500/10 border-orange-500/30 text-orange-500 dark:text-orange-400 font-bold px-2 py-0.5 rounded-xs">
                                    Admin Report
                                </Badge>
                                <span className="text-muted-foreground text-xs font-mono">ID: {event._id.slice(-8)}</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
                                {event.type === 'sports' ? `${event.homeTeam?.name || event.homeTeam} vs ${event.awayTeam?.name || event.awayTeam}` : event.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                                <div className="flex items-center gap-1.5 font-medium">
                                    <Calendar size={15} className="text-orange-500" />
                                    {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
                                </div>
                                <div className="flex items-center gap-1.5 font-medium">
                                    <MapPin size={15} className="text-orange-500" />
                                    {event.venue}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2.5 flex-wrap justify-start md:justify-end">
                        <Button asChild variant="outline" className="border-border dark:border-zinc-800 bg-card hover:bg-muted text-foreground font-semibold rounded-sm shadow-sm h-10">
                            <Link href={`/u/a/events/${event._id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Event
                            </Link>
                        </Button>
                        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-sm shadow-sm h-10 uppercase tracking-wider text-xs">
                            <Link href={`/u/a/events/${id}/generate-wizard`}>
                                <Plus size={15} className="mr-1.5" /> Generate Tickets
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="border-orange-500/30 text-orange-500 dark:text-orange-400 bg-orange-500/5 hover:bg-orange-500/10 font-bold rounded-sm shadow-sm h-10">
                            <Link href={`/u/a/events/${id}/tickets-for-sale`}>
                                <Download size={15} className="mr-1.5" /> Print Tickets
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card border border-border dark:border-zinc-800 rounded-sm p-5 shadow-sm dark:shadow-black/40 hover:border-orange-500/40 dark:hover:border-zinc-700 transition-all duration-200 group">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                Total Tickets
                            </span>
                            <div className="w-8 h-8 rounded-xs bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                <Ticket className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-3xl text-foreground font-black tracking-tight">{stats.totalTickets}</div>
                            <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">Units Sold</p>
                        </div>
                    </div>

                    <div className="bg-card border border-border dark:border-zinc-800 rounded-sm p-5 shadow-sm dark:shadow-black/40 hover:border-emerald-500/40 dark:hover:border-zinc-700 transition-all duration-200 group">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                Ticket Revenue
                            </span>
                            <div className="w-8 h-8 rounded-xs bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-3xl text-foreground font-black tracking-tight">₦{stats.totalRevenue.toLocaleString()}</div>
                            <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">From ticket sales</p>
                        </div>
                    </div>

                    <div className="bg-card border border-border dark:border-zinc-800 rounded-sm p-5 shadow-sm dark:shadow-black/40 hover:border-blue-500/40 dark:hover:border-zinc-700 transition-all duration-200 group">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                Checked In
                            </span>
                            <div className="w-8 h-8 rounded-xs bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <CheckCircle className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-3xl text-foreground font-black tracking-tight">{stats.checkedInCount}</div>
                            <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">Attendees At Venue</p>
                        </div>
                    </div>

                    <div className="bg-card border border-border dark:border-zinc-800 rounded-sm p-5 shadow-sm dark:shadow-black/40 hover:border-purple-500/40 dark:hover:border-zinc-700 transition-all duration-200 group">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                Check-in Rate
                            </span>
                            <div className="w-8 h-8 rounded-xs bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                <Users className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-3xl text-foreground font-black tracking-tight">{stats.checkInRate.toFixed(1)}%</div>
                            <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">Of total ticket holders</p>
                        </div>
                    </div>
                </div>

                {/* Sales & Application Status Summary Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ticket Sales Status Card */}
                    <div className="bg-card border border-border dark:border-zinc-800 rounded-sm p-5 shadow-sm dark:shadow-black/40 space-y-3">
                        <div className="flex items-center justify-between border-b border-border/60 dark:border-zinc-800 pb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Ticket Sales Eligibility
                            </span>
                            <Ticket className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="space-y-3 pt-1">
                            <div className="flex items-center gap-2">
                                {Array.isArray(event.ticketTypes) && event.ticketTypes.length > 0 ? (
                                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 font-bold rounded-xs">
                                        🟢 Tickets Selling Active ({event.ticketTypes.length} Tiers)
                                    </Badge>
                                ) : event.allowNoTickets ? (
                                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs px-3 py-1 font-bold rounded-xs">
                                        🟡 Free Entry / No Tickets Configured
                                    </Badge>
                                ) : (
                                    <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 text-xs px-3 py-1 font-bold rounded-xs">
                                        🔴 Sales Disabled (No Ticket Tiers)
                                    </Badge>
                                )}
                            </div>
                            {Array.isArray(event.ticketTypes) && event.ticketTypes.length > 0 && (
                                <div className="text-xs text-muted-foreground space-y-2 pt-1">
                                    <p className="font-semibold text-foreground text-xs">Configured Ticket Tiers:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {event.ticketTypes.map((tier: any, idx: number) => (
                                            <span key={idx} className="bg-muted/60 dark:bg-zinc-800/80 px-3 py-1 rounded-xs border border-border dark:border-zinc-700 text-xs text-foreground font-medium">
                                                {tier.name}: <strong className="text-emerald-600 dark:text-emerald-400 ml-1 font-bold">₦{tier.price?.toLocaleString() || '0'}</strong>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Application Requirement Status Card */}
                    <div className="bg-card border border-border dark:border-zinc-800 rounded-sm p-5 shadow-sm dark:shadow-black/40 space-y-3">
                        <div className="flex items-center justify-between border-b border-border/60 dark:border-zinc-800 pb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Application Requirement
                            </span>
                            <ClipboardList className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="space-y-3 pt-1">
                            <div className="flex items-center gap-2">
                                {event.requiresApplication ? (
                                    <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-xs px-3 py-1 font-bold rounded-xs">
                                        📋 Application Required
                                    </Badge>
                                ) : (
                                    <Badge className="bg-muted text-muted-foreground border border-border dark:border-zinc-800 text-xs px-3 py-1 font-bold rounded-xs">
                                        ⚡ Direct Ticket Booking (No Application)
                                    </Badge>
                                )}
                            </div>
                            {event.requiresApplication && (
                                <div className="text-xs text-muted-foreground space-y-1.5 pt-1">
                                    <p>Application Fee: <strong className="text-foreground font-semibold">{event.applicationFee ? `₦${event.applicationFee.toLocaleString()}` : 'Free'}</strong></p>
                                    <p>Form Fields Configured: <strong className="text-foreground font-semibold">{event.formFields?.length || 0} fields</strong></p>
                                    <p>Total Submissions: <strong className="text-orange-500 dark:text-orange-400 font-semibold">{applicants.length} applications</strong></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Revenue Breakdown (only for events with application forms) ── */}
                {appStats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Ticket Revenue */}
                        <div className="bg-card border border-border dark:border-zinc-800 rounded-sm p-5 shadow-sm dark:shadow-black/40 relative overflow-hidden group">
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0" />
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                    Ticket Sales Revenue
                                </span>
                                <Ticket className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="mt-3">
                                <div className="text-3xl text-emerald-600 dark:text-emerald-400 font-black tracking-tight">₦{stats.totalRevenue.toLocaleString()}</div>
                                <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{stats.totalTickets} ticket{stats.totalTickets !== 1 ? 's' : ''} sold</p>
                            </div>
                        </div>

                        {/* Application Form Revenue */}
                        <div className="bg-card border border-border dark:border-zinc-800 rounded-sm p-5 shadow-sm dark:shadow-black/40 relative overflow-hidden group">
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0" />
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                    Application Form Revenue
                                </span>
                                <ClipboardList className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="mt-3">
                                <div className="text-3xl text-amber-600 dark:text-amber-400 font-black tracking-tight">₦{appStats.applicationRevenue.toLocaleString()}</div>
                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
                                    <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                                        {appStats.paidCount} paid · ₦{appStats.applicationFee.toLocaleString()} each
                                    </span>
                                    {appStats.freeCount > 0 && (
                                        <span className="text-[11px] text-muted-foreground/80 uppercase tracking-wider">{appStats.freeCount} free</span>
                                    )}
                                    {appStats.unpaidCount > 0 && (
                                        <span className="text-[11px] text-red-500 font-medium uppercase tracking-wider">{appStats.unpaidCount} unpaid</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Total Combined Revenue */}
                        <div className="bg-card border border-orange-500/30 rounded-sm p-5 shadow-md shadow-orange-500/5 relative overflow-hidden group">
                            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-500 to-red-500" />
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                    Total Combined Revenue
                                </span>
                                <Layers className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="mt-3">
                                <div className="text-3xl text-foreground font-black tracking-tight">₦{totalCombinedRevenue.toLocaleString()}</div>
                                <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">Tickets + Application forms</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Category Breakdown */}
                    <div className="bg-card border border-border dark:border-zinc-800 rounded-sm shadow-sm dark:shadow-black/40 overflow-hidden lg:col-span-1 flex flex-col">
                        <div className="p-5 border-b border-border/80 dark:border-zinc-800 bg-muted/20 dark:bg-zinc-900/40">
                            <h3 className="text-foreground text-base font-bold">Sales Breakdown</h3>
                            <p className="text-muted-foreground text-xs mt-0.5">Per ticket category</p>
                        </div>
                        <div className="p-5 space-y-6 flex-1">
                            {stats.categoryBreakdown.map((cat: any) => (
                                <div key={cat.name} className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-foreground font-bold">{cat.name}</span>
                                        <span className="text-foreground font-black">{cat.count} <span className="text-muted-foreground font-normal text-xs">tickets</span></span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                                        <span>Revenue</span>
                                        <span className="font-bold text-foreground">₦{cat.revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-muted dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-orange-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${stats.totalTickets > 0 ? (cat.count / stats.totalTickets) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {stats.categoryBreakdown.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground text-xs italic">
                                    No sales breakdown data available.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attendee List */}
                    <div className="bg-card border border-border dark:border-zinc-800 rounded-sm shadow-sm dark:shadow-black/40 overflow-hidden lg:col-span-2 flex flex-col">
                        <div className="p-5 border-b border-border/80 dark:border-zinc-800 bg-muted/20 dark:bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-foreground text-base font-bold">Attendee List</h3>
                                <p className="text-muted-foreground text-xs mt-0.5">Manage individual ticket holders</p>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search attendees..."
                                    value={attendeeSearch}
                                    onChange={(e) => setAttendeeSearch(e.target.value)}
                                    className="pl-9 pr-3 py-1.5 bg-background border border-border dark:border-zinc-800 rounded-sm text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500/25 outline-none w-full"
                                />
                            </div>
                        </div>
                        <div className="p-0 max-h-[500px] overflow-auto flex-1">
                            <Table>
                                <TableHeader className="bg-muted/40 dark:bg-zinc-800/40 sticky top-0 z-10 border-b border-border dark:border-zinc-800">
                                    <TableRow className="border-border dark:border-zinc-800">
                                        <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Holder</TableHead>
                                        <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Category</TableHead>
                                        <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                                        <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold text-right">Reference</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTickets.map((ticket: any) => (
                                        <TableRow key={ticket._id} className="border-border/60 dark:border-zinc-800/60 hover:bg-muted/30 dark:hover:bg-zinc-800/40 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-foreground font-bold text-sm">
                                                        {ticket.holderName !== 'Guest' ? ticket.holderName : (
                                                            ticket.createdBy ? `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}` : 'Guest'
                                                        )}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground">{ticket.createdBy?.email || 'Walk-in Customer'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-muted dark:bg-zinc-800 text-foreground border border-border dark:border-zinc-700 font-bold text-[10px] uppercase tracking-wider rounded-xs">
                                                    {ticket.stand || "Regular"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {ticket.isInside ? (
                                                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] uppercase tracking-wider font-bold rounded-xs">
                                                        Checked In
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground border-border dark:border-zinc-700 text-[10px] uppercase tracking-wider font-semibold rounded-xs">
                                                        Pending
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-xs text-muted-foreground">
                                                {ticket.ticketNumber.slice(-8)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredTickets.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-16 text-muted-foreground text-sm italic">
                                                No attendees found matching your search.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Applicants List */}
                {event.requiresApplication && (
                    <div className="bg-card border border-border dark:border-zinc-800 rounded-sm shadow-sm dark:shadow-black/40 overflow-hidden flex flex-col">
                        <div className="p-5 border-b border-border/80 dark:border-zinc-800 bg-muted/20 dark:bg-zinc-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-foreground text-base font-bold">Applicants List</h3>
                                <p className="text-muted-foreground text-xs mt-0.5">Review and approve attendee applications</p>
                            </div>
                            <Button
                                onClick={exportApplicantsToCSV}
                                variant="outline"
                                size="sm"
                                className="border-border dark:border-zinc-800 bg-card hover:bg-muted text-foreground font-bold rounded-sm shadow-sm"
                            >
                                <Download size={14} className="mr-2" /> Export Applicants
                            </Button>
                        </div>
                        <div className="p-0 max-h-[500px] overflow-auto flex-1">
                            <Table>
                                <TableHeader className="bg-muted/40 dark:bg-zinc-800/40 sticky top-0 z-10 border-b border-border dark:border-zinc-800">
                                    <TableRow className="border-border dark:border-zinc-800">
                                        <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Applicant</TableHead>
                                        <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Submitted</TableHead>
                                        <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                                        <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applicants.map((app: any) => (
                                        <TableRow key={app._id} className="border-border/60 dark:border-zinc-800/60 hover:bg-muted/30 dark:hover:bg-zinc-800/40 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-foreground font-bold text-sm">
                                                        {app.user?.firstName} {app.user?.lastName}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground">{app.user?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-muted-foreground font-medium">
                                                    {app.submittedAt ? format(new Date(app.submittedAt), 'MMM dd, yyyy') : 'Not submitted'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-[10px] uppercase tracking-wider font-bold rounded-xs ${
                                                    app.status === 'approved' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                                                    app.status === 'rejected' ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' :
                                                    app.status === 'completed' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' :
                                                    'bg-muted text-muted-foreground border-border dark:border-zinc-700'
                                                }`}>
                                                    {app.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-3.5 border-border dark:border-zinc-700 text-foreground hover:bg-muted text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all shadow-sm"
                                                >
                                                    <Link href={`/u/applications/${app._id}`}>
                                                        Review Submission
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {applicants.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-16 text-muted-foreground text-sm italic">
                                                No applicants found yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
