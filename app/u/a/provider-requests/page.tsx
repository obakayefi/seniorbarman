"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ClipboardList, CheckCircle2, XCircle, Clock, Trophy, Briefcase, User, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProviderRequest {
    _id: string
    userId: { _id: string; firstName: string; lastName: string; email: string; createdAt: string }
    email: string
    role: "organizer" | "team_manager"
    teamId?: { _id: string; name: string; logo?: string }
    organizationName?: string
    status: "pending" | "approved" | "rejected"
    createdAt: string
}

function RoleChip({ role }: { role: string }) {
    if (role === "team_manager") return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Trophy size={11} /> Team Manager
        </span>
    )
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
            <Briefcase size={11} /> Organizer
        </span>
    )
}

function RequestCard({ request, onAction }: { request: ProviderRequest; onAction: () => void }) {
    const [acting, setActing] = useState(false)

    const handleApprove = async () => {
        setActing(true)
        try {
            await api.patch(`/admin/provider-requests/${request._id}`, { status: "approved" })
            toast.success(`${request.userId.firstName}'s account approved as ${request.role.replace('_', ' ')}`)
            onAction()
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Approval failed")
        } finally {
            setActing(false)
        }
    }

    const handleReject = async () => {
        setActing(true)
        try {
            await api.patch(`/admin/provider-requests/${request._id}`, {
                status: "rejected",
                reviewNote: "Application rejected by administrator"
            })
            toast.success("Request rejected and email blacklisted")
            onAction()
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Rejection failed")
        } finally {
            setActing(false)
        }
    }

    return (
        <Card className="/80 overflow-hidden hover: transition-all duration-300 relative group">
            {/* Left role accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${request.role === 'team_manager' ? 'bg-emerald-500' : 'bg-blue-500'}`} />

            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    {/* Applicant info */}
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-sm bg-muted border border-border flex items-center justify-center shrink-0">
                            <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-foreground font-black text-lg leading-none">
                                    {request.userId.firstName} {request.userId.lastName}
                                </p>
                                <RoleChip role={request.role} />
                            </div>
                            <p className="text-muted-foreground text-sm font-mono">{request.email}</p>
                            {request.role === "team_manager" && request.teamId && (
                                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                                    <Trophy size={11} />
                                    <span className="font-semibold">{request.teamId.name}</span>
                                </div>
                            )}
                            {request.role === "organizer" && request.organizationName && (
                                <div className="flex items-center gap-1.5 text-xs text-blue-400">
                                    <Briefcase size={11} />
                                    <span className="font-semibold">{request.organizationName}</span>
                                </div>
                            )}
                            <p className="text-muted-foreground/60 text-xs flex items-center gap-1">
                                <Clock size={10} />
                                Applied {new Date(request.createdAt).toLocaleDateString('en-GB', {
                                    day: 'numeric', month: 'short', year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Approve */}
                        <Button
                            onClick={handleApprove}
                            disabled={acting}
                            className="bg-emerald-600 hover:bg-emerald-500 text-foreground border-0 gap-2 shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
                        >
                            {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Approve
                        </Button>

                        {/* Reject — confirmation dialog */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    disabled={acting}
                                    variant="outline"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 gap-2 transition-all duration-300"
                                >
                                    <XCircle className="w-4 h-4" /> Reject
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border border-border text-foreground">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2 text-red-400">
                                        <AlertTriangle className="w-5 h-5" /> Reject Provider Request
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">
                                        This will permanently reject the application from <strong className="text-foreground">{request.userId.firstName} {request.userId.lastName}</strong> and add <strong className="text-foreground">{request.email}</strong> to the platform blacklist. Their account will be deleted and they will not be able to register or log in again.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-card border-border text-foreground hover:bg-muted">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleReject}
                                        className="bg-red-600 hover:bg-red-700 text-foreground border-0"
                                    >
                                        Confirm Rejection
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function ProviderRequestsPage() {
    const [requests, setRequests] = useState<ProviderRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>("pending")

    const fetchRequests = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get(`/admin/provider-requests?status=${statusFilter}`)
            setRequests(res.data.requests || [])
        } catch {
            toast.error("Failed to fetch provider requests")
        } finally {
            setLoading(false)
        }
    }, [statusFilter])

    useEffect(() => { fetchRequests() }, [fetchRequests])

    const pendingCount = requests.filter(r => r.status === "pending").length

    return (
        <div className="md:p-10 p-6 w-full space-y-8 min-h-screen bg-background">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase tracking-tight flex items-center gap-3">
                        <ClipboardList className="text-orange-500" /> Provider Requests
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Review applications from Organizers and Team Managers
                        {statusFilter === "pending" && pendingCount > 0 && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">
                                {pendingCount} pending
                            </span>
                        )}
                    </p>
                </div>

                {/* Status filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-card border-border text-foreground w-40 rounded-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                        <SelectItem value="pending">
                            <span className="flex items-center gap-2"><Clock size={13} className="text-orange-400" /> Pending</span>
                        </SelectItem>
                        <SelectItem value="approved">
                            <span className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-400" /> Approved</span>
                        </SelectItem>
                        <SelectItem value="rejected">
                            <span className="flex items-center gap-2"><XCircle size={13} className="text-red-400" /> Rejected</span>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    <p className="text-muted-foreground font-medium animate-pulse">Loading requests...</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-5">
                    <div className="p-6 rounded-sm bg-muted border border-border">
                        <ClipboardList className="w-12 h-12 text-zinc-700" />
                    </div>
                    <div className="text-center">
                        <p className="text-foreground font-bold text-xl">No {statusFilter} requests</p>
                        <p className="text-muted-foreground text-sm mt-1">
                            {statusFilter === "pending"
                                ? "All clear! No pending provider applications at this time."
                                : `No ${statusFilter} provider requests found.`}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <RequestCard key={req._id} request={req} onAction={fetchRequests} />
                    ))}
                </div>
            )}
        </div>
    )
}
