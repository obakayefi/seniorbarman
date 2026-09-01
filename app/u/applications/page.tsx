"use client"
import React, { useEffect, useState } from 'react'
import { DashboardLayoutWrapper } from '@/components/layout/DashboardLayoutWrapper'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    Loader2, ClipboardList, CheckCircle2, AlertCircle,
    Clock, ArrowRight, ExternalLink, QrCode
} from "lucide-react"
import { format } from 'date-fns'
import Link from 'next/link'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending_payment: {
        label: "Payment Pending",
        color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        icon: <Clock size={14} />,
    },
    pending_form: {
        label: "Form Not Submitted",
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        icon: <ClipboardList size={14} />,
    },
    completed: {
        label: "Under Review",
        color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        icon: <Clock size={14} />,
    },
    approved: {
        label: "Approved",
        color: "bg-green-500/10 text-green-500 border-green-500/20",
        icon: <CheckCircle2 size={14} />,
    },
    rejected: {
        label: "Not Approved",
        color: "bg-red-500/10 text-red-500 border-red-500/20",
        icon: <AlertCircle size={14} />,
    },
}

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const verifiedRefs = React.useRef(new Set<string>());

    const fetchApplications = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true)
            const res = await fetch('/api/applications')
            const data = await res.json()
            if (res.ok) {
                setApplications(data.applications || [])
            } else {
                toast.error(data.error || "Failed to load applications")
            }
        } catch (error) {
            toast.error("Failed to load your applications")
        } finally {
            if (showLoading) setLoading(false)
        }
    }

    useEffect(() => {
        fetchApplications()
    }, [])

    // Background verification for pending payments
    useEffect(() => {
        const verifyPending = async () => {
            const pending = applications.filter(app => 
                app.status === 'pending_payment' && 
                app.paymentRef && 
                !verifiedRefs.current.has(app.paymentRef)
            );

            if (pending.length === 0) return;

            let anyVerified = false;

            for (const app of pending) {
                verifiedRefs.current.add(app.paymentRef);
                try {
                    console.log(`[SILENT-VERIFY] Checking reference: ${app.paymentRef}`);
                    const res = await fetch(`/api/payment/verify?reference=${app.paymentRef}`);
                    const data = await res.json();
                    
                    if (data.status === 'success') {
                        anyVerified = true;
                        toast.success(`Payment confirmed for ${app.event?.title || 'your application'}!`, {
                            description: "Your status has been updated."
                        });
                    }
                } catch (e) {
                    console.error("Silent verify failed for ref:", app.paymentRef, e);
                }
            }

            if (anyVerified) {
                // Refresh list without showing global loader
                fetchApplications(false);
            }
        };

        if (applications.length > 0) {
            verifyPending();
        }
    }, [applications]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                <p className="font-medium">Loading your applications…</p>
            </div>
        )
    }

    return (
        <DashboardLayoutWrapper title="My Applications" description="Track the status of all your event applications">
            <div className="max-w-4xl space-y-8">
                {/* Empty state */}
                {applications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                        <div className="h-16 w-16 rounded-2xl bg-muted border border-border flex items-center justify-center">
                            <ClipboardList size={28} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-black text-foreground">No Applications Yet</h3>
                        <p className="text-muted-foreground text-sm max-w-xs">When you apply to an event that requires an application, it will appear here.</p>
                        <Button asChild className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black">
                            <Link href="/events">Explore Events</Link>
                        </Button>
                    </div>
                )}

                {/* Applications list */}
                <div className="space-y-4">
                    {applications.map((app: any) => {
                        const event = app.event
                        const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.completed
                        const canFillForm = app.status === "pending_form"
                        const isApproved = app.status === "approved"

                        return (
                            <div
                                key={app._id}
                                className="bg-card text-card-foreground border border-border rounded-3xl overflow-hidden hover:border-orange-500/40 transition-all shadow-sm"
                            >
                                {/* Top: Event info */}
                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        {/* Event image */}
                                        {event?.image ? (
                                            <img
                                                src={event.image}
                                                alt={event.title}
                                                className="h-16 w-16 rounded-2xl object-cover shrink-0 border border-border"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center shrink-0 border border-border">
                                                <ClipboardList size={24} className="text-muted-foreground" />
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                {event?.type === 'sports' ? 'Sports Match' : 'Event Application'}
                                            </p>
                                            <h3 className="text-lg font-black text-foreground leading-tight">
                                                {event?.type === 'sports'
                                                    ? `${event.homeTeam?.name || event.homeTeam} vs ${event.awayTeam?.name || event.awayTeam}`
                                                    : event?.title || "Unknown Event"}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                {event?.date && (
                                                    <span>{format(new Date(event.date), 'EEE, MMM dd yyyy')}</span>
                                                )}
                                                {event?.venue && (
                                                    <span>· {event.venue}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="shrink-0">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${statusCfg.color}`}>
                                            {statusCfg.icon}
                                            {statusCfg.label}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom: Meta + Actions */}
                                <div className="border-t border-border px-6 py-4 bg-muted/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground uppercase tracking-widest font-bold">
                                        <span>
                                            Fee: {app.paymentStatus === 'free'
                                                ? 'Free'
                                                : app.paymentStatus === 'paid'
                                                    ? `₦${event?.applicationFee?.toLocaleString() || '—'} Paid`
                                                    : 'Payment Pending'}
                                        </span>
                                        {app.submittedAt && (
                                            <span>Submitted: {format(new Date(app.submittedAt), 'MMM dd, yyyy')}</span>
                                        )}
                                        <span className="font-mono normal-case opacity-60">
                                            ref: {app.paymentRef?.slice(-10) || 'free'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* View Event Link */}
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="ghost"
                                            className="text-muted-foreground hover:text-foreground h-8 text-xs gap-1"
                                        >
                                            <Link href={`/events/${event?._id}`}>
                                                Event Page <ExternalLink size={12} />
                                            </Link>
                                        </Button>

                                        {/* Fill Form */}
                                        {canFillForm && (
                                            <Button
                                                asChild
                                                size="sm"
                                                className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl gap-1"
                                            >
                                                <Link href={`/u/events/${event?._id}/apply`}>
                                                    <ClipboardList size={12} />
                                                    Fill Application Form
                                                </Link>
                                            </Button>
                                        )}

                                        {/* Book tickets if approved */}
                                        {isApproved && (
                                            <div className="flex gap-2">
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    className="h-8 bg-muted hover:bg-muted/80 text-foreground text-xs font-black rounded-xl gap-1 border border-border"
                                                >
                                                    <Link href={`/u/applications/${app._id}`}>
                                                        <QrCode size={12} />
                                                        View Entry Pass
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    asChild
                                                    className="h-8 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl gap-1"
                                                >
                                                    <Link href={`/events/${event?._id}`}>
                                                        Book Tickets <ArrowRight size={12} />
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}

                                        {/* View Answers (read-only) */}
                                        {(app.status === 'completed' || app.status === 'approved' || app.status === 'rejected') && (
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="h-8 border-border text-muted-foreground hover:text-foreground text-xs rounded-xl gap-1"
                                            >
                                                <Link href={`/u/applications/${app._id}`}>
                                                    View Answers
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </DashboardLayoutWrapper>
    )
}
