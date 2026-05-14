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
    ArrowLeft, Edit, Printer, Calendar, MapPin, Search, Plus, Download,
    ExternalLink
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

                // Fetch applicants if required
                if (res.data.event.requiresApplication) {
                    const appRes = await api.get(`/events/${id}/applicants`)
                    setApplicants(appRes.data.applicants || [])
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-500 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                <p className="text-lg font-medium">Analyzing event data...</p>
            </div>
        )
    }

    if (!data?.event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-500 gap-4">
                <p className="text-xl">Event not found</p>
                <Button asChild variant="outline">
                    <Link href="/u/a/events/manage">Back to Management</Link>
                </Button>
            </div>
        )
    }

    const { event, stats, tickets } = data
    const filteredTickets = tickets.filter((t: any) =>
        (t.holderName?.toLowerCase().includes(attendeeSearch.toLowerCase())) ||
        (t.createdBy?.firstName?.toLowerCase().includes(attendeeSearch.toLowerCase())) ||
        (t.createdBy?.lastName?.toLowerCase().includes(attendeeSearch.toLowerCase())) ||
        (t.createdBy?.email?.toLowerCase().includes(attendeeSearch.toLowerCase())) ||
        (t.ticketNumber?.toLowerCase().includes(attendeeSearch.toLowerCase()))
    )

    return (
        <div className="md:p-10 p-6 w-full space-y-8 min-h-screen bg-zinc-950 text-white pb-20">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Link href="/u/a/events/manage" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Management
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-orange-500/10 border-orange-500/30 text-orange-400">
                                    Admin Report
                                </Badge>
                                <span className="text-zinc-500 text-xs font-mono uppercase">ID: {event._id.slice(-8)}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                                {event.type === 'sports' ? `${event.homeTeam} vs ${event.awayTeam}` : event.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 mt-4 text-zinc-400 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-orange-500" />
                                    {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={14} className="text-orange-500" />
                                    {event.venue}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 flex-wrap justify-end">
                        <Button asChild variant="outline" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800">
                            <Link href={`/u/a/events/${event._id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Event
                            </Link>
                        </Button>
                        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white font-black w-full md:w-auto uppercase tracking-tighter">
                            <Link href={`/u/a/events/${id}/generate-wizard`}>
                                <Plus size={16} className="mr-2" /> Generate Tickets for Sale
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="border-zinc-800 text-orange-500 hover:bg-zinc-900 font-bold w-full md:w-auto">
                            <Link href={`/u/a/events/${id}/tickets-for-sale`}>
                                <Download size={16} className="mr-2" /> Print Tickets For Sale
                            </Link>
                        </Button>

                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group">
                        <CardHeader className="p-4 pb-2 space-y-0">
                            <CardTitle className="text-zinc-500 text-xs font-black uppercase tracking-widest flex items-center justify-between">
                                Total Tickets
                                <Ticket className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl text-zinc-100 font-black">{stats.totalTickets}</div>
                            <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-tighter">Units Sold</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group">
                        <CardHeader className="p-4 pb-2 space-y-0">
                            <CardTitle className="text-zinc-500 text-xs font-black uppercase tracking-widest flex items-center justify-between">
                                Total Revenue
                                <TrendingUp className="h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl text-zinc-100 font-black">₦{stats.totalRevenue.toLocaleString()}</div>
                            <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-tighter">Gross Potential</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group">
                        <CardHeader className="p-4 pb-2 space-y-0">
                            <CardTitle className="text-zinc-500 text-xs font-black uppercase tracking-widest flex items-center justify-between">
                                Checked In
                                <CheckCircle className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl text-zinc-100 font-black">{stats.checkedInCount}</div>
                            <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-tighter">Attendees At Venue</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden group">
                        <CardHeader className="p-4 pb-2 space-y-0">
                            <CardTitle className="text-zinc-500 text-xs font-black uppercase tracking-widest flex items-center justify-between">
                                Check-in Rate
                                <Users className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-3xl text-zinc-100 font-black">{stats.checkInRate.toFixed(1)}%</div>
                            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div
                                    className="bg-purple-500 h-full transition-all duration-1000"
                                    style={{ width: `${stats.checkInRate}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Category Breakdown */}
                    <Card className="bg-zinc-900 border-zinc-800 lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">Sales Breakdown</CardTitle>
                            <CardDescription className="text-zinc-500 text-xs">Per ticket category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {stats.categoryBreakdown.map((cat: any) => (
                                    <div key={cat.name} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-300 font-bold">{cat.name}</span>
                                            <span className="text-white font-black">{cat.count} <span className="text-zinc-500 font-normal">pts</span></span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-zinc-500">
                                            <span>Revenue</span>
                                            <span>₦{cat.revenue.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                            <div
                                                className="bg-orange-500 h-full"
                                                style={{ width: `${(cat.count / stats.totalTickets) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attendee List */}
                    <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/50 pb-6">
                            <div>
                                <CardTitle className="text-white text-lg">Attendee List</CardTitle>
                                <CardDescription className="text-zinc-500 text-xs">Manage individual ticket holders</CardDescription>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email or ID..."
                                    value={attendeeSearch}
                                    onChange={(e) => setAttendeeSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm transition-all focus:border-orange-500 ring-0 outline-none w-full md:w-64"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[600px] overflow-auto">
                            <Table>
                                <TableHeader className="bg-zinc-950/30 sticky top-0 z-10">
                                    <TableRow className="border-zinc-800">
                                        <TableHead className="text-zinc-400 text-[10px] uppercase tracking-widest">Holder</TableHead>
                                        <TableHead className="text-zinc-400 text-[10px] uppercase tracking-widest">Category</TableHead>
                                        <TableHead className="text-zinc-400 text-[10px] uppercase tracking-widest">Status</TableHead>
                                        <TableHead className="text-zinc-400 text-[10px] uppercase tracking-widest text-right">Reference</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTickets.map((ticket: any) => (
                                        <TableRow key={ticket._id} className="border-zinc-800 hover:bg-white/[0.02] transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-sm">
                                                        {ticket.holderName !== 'Guest' ? ticket.holderName : (
                                                            ticket.createdBy ? `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}` : 'Guest'
                                                        )}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 lowercase">{ticket.createdBy?.email || 'Walk-in Customer'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 border-none font-bold text-[9px] uppercase tracking-tighter">
                                                    {ticket.stand || "Regular"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {ticket.isInside ? (
                                                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px] uppercase tracking-widest font-black">
                                                        Checked In
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-zinc-600 border-zinc-800 text-[9px] uppercase tracking-widest font-black">
                                                        Pending
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-[10px] text-zinc-500">
                                                {ticket.ticketNumber.slice(-8)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredTickets.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-20 text-zinc-600 italic">
                                                No attendees found matching your search.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Applicants List */}
                {event.requiresApplication && (
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/50 pb-6">
                            <div>
                                <CardTitle className="text-white text-lg">Applicants List</CardTitle>
                                <CardDescription className="text-zinc-500 text-xs">Review and approve applications</CardDescription>
                            </div>
                            <Button
                                onClick={exportApplicantsToCSV}
                                variant="outline"
                                size="sm"
                                className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 font-bold"
                            >
                                <Download size={14} className="mr-2" /> Export Applicants
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[600px] overflow-auto">
                            <Table>
                                <TableHeader className="bg-zinc-950/30 sticky top-0 z-10">
                                    <TableRow className="border-zinc-800">
                                        <TableHead className="text-zinc-400 text-[10px] uppercase tracking-widest">Applicant</TableHead>
                                        <TableHead className="text-zinc-400 text-[10px] uppercase tracking-widest">Submitted</TableHead>
                                        <TableHead className="text-zinc-400 text-[10px] uppercase tracking-widest">Status</TableHead>
                                        <TableHead className="text-zinc-400 text-[10px] uppercase tracking-widest text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applicants.map((app: any) => (
                                        <TableRow key={app._id} className="border-zinc-800 hover:bg-white/[0.02] transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-sm">
                                                        {app.user?.firstName} {app.user?.lastName}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 lowercase">{app.user?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-zinc-400">
                                                    {app.submittedAt ? format(new Date(app.submittedAt), 'MMM dd, yyyy') : 'Not submitted'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`text-[9px] uppercase tracking-widest font-black border-none ${app.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                                    app.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                                        app.status === 'completed' ? 'bg-blue-500/10 text-blue-500' :
                                                            'bg-zinc-800 text-zinc-400'
                                                    }`}>
                                                    {app.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 px-3 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all rounded-lg text-[10px] font-bold uppercase tracking-widest"
                                                        onClick={() => setSelectedAppForView(app)}
                                                    >
                                                        View Responses
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="h-8 px-4 text-[10px] bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-[0_5px_15px_rgba(22,163,74,0.2)] hover:scale-105 active:scale-95"
                                                        onClick={() => handleUpdateApplicant(app._id, 'approved')}
                                                        disabled={app.status === 'approved' || !['completed', 'approved', 'rejected'].includes(app.status)}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 px-4 text-[10px] border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-black uppercase tracking-widest rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                                                        onClick={() => setRejectionModal({ appId: app._id })}
                                                        disabled={app.status === 'rejected'}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {applicants.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-20 text-zinc-600 italic">
                                                No applicants found yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* View Answers Modal */}
            <Dialog open={!!selectedAppForView} onOpenChange={(open) => !open && setSelectedAppForView(null)}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Application Details</DialogTitle>
                        <DialogDescription className="text-zinc-500">
                            Submitted by {selectedAppForView?.user?.firstName} {selectedAppForView?.user?.lastName}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-6">
                        <div className="grid grid-cols-2 gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Status</p>
                                <Badge variant="outline" className={`text-[9px] uppercase tracking-widest font-black border-none ${selectedAppForView?.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                    selectedAppForView?.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                        'bg-blue-500/10 text-blue-500'
                                    }`}>
                                    {selectedAppForView?.status?.replace('_', ' ')}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Payment</p>
                                <p className="text-xs text-white font-bold">{selectedAppForView?.paymentStatus?.toUpperCase()}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Form Answers</h4>

                            {selectedAppForView?.applicantPicture && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Applicant Photo</p>
                                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/10">
                                        <img src={selectedAppForView.applicantPicture} alt="Applicant" className="object-cover w-full h-full" />
                                    </div>
                                </div>
                            )}

                            {selectedAppForView?.formAnswers && selectedAppForView.formAnswers.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedAppForView.formAnswers.map((ans: any, idx: number) => (
                                        <div key={idx} className="space-y-1">
                                            <p className="text-xs text-zinc-400 font-bold">{ans.fieldLabel}</p>
                                            <p className="text-sm text-white bg-zinc-900/30 p-2 rounded-lg border border-white/5">
                                                {Array.isArray(ans.answer) ? ans.answer.join(', ') : (ans.answer || '—')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-zinc-600 italic">No custom answers provided.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white hover:text-black font-black rounded-xl transition-all"
                            onClick={() => {
                                handleUpdateApplicant(selectedAppForView._id, 'approved')
                                setSelectedAppForView(null)
                            }}
                            disabled={selectedAppForView?.status === 'approved' || !['completed', 'approved', 'rejected'].includes(selectedAppForView?.status)}
                        >
                            Approve
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-black rounded-xl transition-all"
                            onClick={() => {
                                setRejectionModal({ appId: selectedAppForView._id })
                                setSelectedAppForView(null)
                            }}
                            disabled={selectedAppForView?.status === 'rejected'}
                        >
                            Reject
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rejection Reason Modal */}
            <Dialog open={!!rejectionModal} onOpenChange={(open) => !open && setRejectionModal(null)}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tighter">Reject Application</DialogTitle>
                        <DialogDescription className="text-zinc-500">
                            Please provide a reason for rejecting this application. This is mandatory.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. Photo does not meet requirements, experience insufficient..."
                            className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-red-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => setRejectionModal(null)} className="flex-1 text-zinc-400">Cancel</Button>
                        <Button
                            variant="destructive"
                            className="flex-1 font-black rounded-xl"
                            disabled={!rejectionReason.trim()}
                            onClick={() => {
                                handleUpdateApplicant(rejectionModal!.appId, 'rejected', rejectionReason)
                                setRejectionModal(null)
                                setRejectionReason('')
                            }}
                        >
                            Reject Application
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
