"use client"
import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from "sonner"
import { 
    Loader2, ChevronLeft, Calendar, MapPin, ShieldAlert, 
    CheckCircle, AlertTriangle, RefreshCw, Eye, Download,
    CheckCircle2, Clock, User, Mail, CreditCard, KeyRound, QrCode
} from "lucide-react"
import { format } from "date-fns"
import api from "@/lib/axios"
import { useApp } from "@/context/AppContext"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    pending_payment: { label: "Payment Pending", color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20" },
    pending_form: { label: "Form Not Submitted", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    completed: { label: "Under Review", color: "text-purple-500 dark:text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    approved: { label: "Approved", color: "text-green-500 dark:text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    rejected: { label: "Not Approved", color: "text-red-500 dark:text-red-400", bg: "bg-red-500/10 border-red-500/20" }
}

export default function ApplicationViewPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const { user: currentUser } = useApp()

    const [application, setApplication] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)

    // Modal controllers
    const [rejectionModalOpen, setRejectionModalOpen] = useState(false)
    const [rejectionReason, setRejectionReason] = useState("")

    const [resetModalOpen, setResetModalOpen] = useState(false)
    const [resetReason, setResetReason] = useState("")

    const fetchApplication = async () => {
        try {
            setLoading(true)
            const { data } = await api.get(`/applications/preview/${id}`)
            setApplication(data.application)
        } catch (error) {
            console.error("Error loading application:", error)
            toast.error("Failed to load application details")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            fetchApplication()
        }
    }, [id])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                <p className="text-lg font-medium">Fetching application credentials...</p>
            </div>
        )
    }

    if (!application) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-4">
                <ShieldAlert className="h-16 w-16 text-red-500" />
                <p className="text-xl text-foreground font-bold">Application Pass Void or Not Found</p>
                <Button asChild variant="outline" className="border-border rounded-xl mt-2">
                    <Link href="/u/applications">Back to My Applications</Link>
                </Button>
            </div>
        )
    }

    const { event, user, status } = application

    // Permissions check: must be applicant, admin, dev, or event organizer (event creator)
    const isAdminOrDev = currentUser?.role === "admin" || currentUser?.role === "dev"
    const isEventOrganizer = event?.createdBy?.toString() === currentUser?.id
    const isApplicant = user?._id?.toString() === currentUser?.id

    if (!isAdminOrDev && !isEventOrganizer && !isApplicant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-4 px-6 text-center">
                <ShieldAlert className="h-16 w-16 text-red-500" />
                <h1 className="text-2xl font-black text-foreground uppercase italic tracking-tight">Access Restricted</h1>
                <p className="text-muted-foreground max-w-sm">You do not have the necessary security clearance to view this private event application.</p>
                <Button asChild variant="outline" className="border-border rounded-xl mt-4">
                    <Link href="/u/applications">Return to Dashboard</Link>
                </Button>
            </div>
        )
    }

    const handleUpdateStatus = async (targetStatus: string, reason?: string) => {
        try {
            setUpdating(true)
            const res = await api.patch(`/events/${event._id}/applicants/${application._id}`, { 
                status: targetStatus, 
                reason 
            })
            if (res.data.success) {
                toast.success(`Application updated to ${targetStatus.replace('_', ' ')} successfully!`)
                setApplication(prev => ({ 
                    ...prev, 
                    status: targetStatus, 
                    rejectionReason: targetStatus === 'rejected' ? reason : undefined 
                }))
            }
        } catch (error: any) {
            console.error("Failed to update status:", error)
            toast.error(error.response?.data?.error || "Failed to update status")
        } finally {
            setUpdating(false)
            setRejectionModalOpen(false)
            setResetModalOpen(false)
        }
    }

    const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.completed

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            {/* Header backdrop */}
            <div className="relative h-72 w-full overflow-hidden border-b border-border bg-muted/20">
                <div 
                    className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-20 scale-110" 
                    style={{ backgroundImage: `url(${event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop'})` }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                
                <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-8 space-y-4">
                    <Link 
                        href={isApplicant ? "/u/applications" : `/u/organizer/events/${event._id}`} 
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-bold uppercase tracking-wider w-fit"
                    >
                        <ChevronLeft size={16} /> Back to Dashboard
                    </Link>
                    
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-orange-500/10 border-orange-500/30 text-orange-500 font-bold rounded-xs px-2.5 py-0.5">
                                Submission details
                            </Badge>
                            <span className="text-muted-foreground text-xs font-mono">ID: {application._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-none uppercase italic">
                            {event.type === 'sports' ? `${event.homeTeam?.name || event.homeTeam} vs ${event.awayTeam?.name || event.awayTeam}` : event.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-muted-foreground text-xs font-medium">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-orange-500" />
                                {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin size={13} className="text-orange-500" />
                                {event.venue}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Response details */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Applicant details */}
                        <Card className="bg-card border border-border dark:border-zinc-800 rounded-sm overflow-hidden shadow-md dark:shadow-black/40">
                            <CardHeader className="border-b border-border/80 dark:border-zinc-800 bg-muted/20 dark:bg-zinc-900/40 p-5 sm:p-6">
                                <CardTitle className="text-foreground text-base font-bold uppercase tracking-wider flex items-center gap-2">
                                    <User className="text-orange-500" size={18} />
                                    Applicant Portfolio
                                </CardTitle>
                                <CardDescription className="text-muted-foreground text-xs">Biographical information provided by the applicant.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 sm:p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                                {/* Profile Headshot */}
                                {application.applicantPicture ? (
                                    <div className="h-44 w-44 rounded-sm overflow-hidden border-2 border-orange-500/20 shadow-md shrink-0">
                                        <img src={application.applicantPicture} alt="Applicant headshot" className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="h-44 w-44 rounded-sm bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0 shadow-inner">
                                        <User size={64} />
                                    </div>
                                )}

                                {/* Bio Grid */}
                                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                    <div className="bg-muted/30 dark:bg-zinc-800/40 p-3.5 rounded-sm border border-border/70 dark:border-zinc-800 space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">First Name</p>
                                        <p className="text-foreground font-bold text-sm flex items-center gap-2">
                                            <User size={14} className="text-orange-500" />
                                            {user.firstName || '—'}
                                        </p>
                                    </div>
                                    <div className="bg-muted/30 dark:bg-zinc-800/40 p-3.5 rounded-sm border border-border/70 dark:border-zinc-800 space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Last Name</p>
                                        <p className="text-foreground font-bold text-sm flex items-center gap-2">
                                            <User size={14} className="text-orange-500" />
                                            {user.lastName || '—'}
                                        </p>
                                    </div>
                                    <div className="bg-muted/30 dark:bg-zinc-800/40 p-3.5 rounded-sm border border-border/70 dark:border-zinc-800 space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</p>
                                        <p className="text-foreground font-bold text-sm flex items-center gap-2 truncate">
                                            <Mail size={14} className="text-orange-500" />
                                            {user.email || '—'}
                                        </p>
                                    </div>
                                    <div className="bg-muted/30 dark:bg-zinc-800/40 p-3.5 rounded-sm border border-border/70 dark:border-zinc-800 space-y-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment Status</p>
                                        <p className="text-foreground font-bold text-sm flex items-center gap-2">
                                            <CreditCard size={14} className="text-orange-500" />
                                            <span className="uppercase text-[10px] font-black bg-muted border border-border text-foreground px-2 py-0.5 rounded-xs">
                                                {application.paymentStatus}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Custom Form Answers */}
                        <Card className="bg-card border border-border dark:border-zinc-800 rounded-sm overflow-hidden shadow-md dark:shadow-black/40">
                            <CardHeader className="border-b border-border/80 dark:border-zinc-800 bg-muted/20 dark:bg-zinc-900/40 p-5 sm:p-6">
                                <CardTitle className="text-foreground text-base font-bold uppercase tracking-wider">Questionnaire Responses</CardTitle>
                                <CardDescription className="text-muted-foreground text-xs">Applicant custom responses to the event questionnaire.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 sm:p-6 md:p-8 space-y-6">
                                {application.formAnswers && application.formAnswers.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {application.formAnswers.map((ans: any, idx: number) => (
                                            <div key={idx} className="bg-muted/30 dark:bg-zinc-800/30 p-4 rounded-sm border border-border/80 dark:border-zinc-800 space-y-2 hover:border-orange-500/30 transition-colors">
                                                <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider border-b border-border pb-1.5">{ans.fieldLabel}</p>
                                                <p className="text-sm text-foreground font-medium leading-relaxed bg-background p-3 rounded-sm border border-border">
                                                    {Array.isArray(ans.answer) ? ans.answer.join(', ') : (ans.answer || '—')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-muted/20 rounded-sm border border-dashed border-border">
                                        <p className="text-muted-foreground text-xs font-medium italic">No custom questionnaire answers were submitted for this application.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Dynamic Action center */}
                    <div className="lg:col-span-4 lg:sticky lg:top-8">
                        <Card className="bg-card border border-border dark:border-zinc-800 rounded-sm shadow-md dark:shadow-black/40 overflow-hidden">
                            
                            <div className="p-5 sm:p-6 border-b border-border/80 dark:border-zinc-800 bg-muted/20 dark:bg-zinc-900/40">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Live Application Status</h3>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs border text-xs font-bold uppercase tracking-wider ${statusCfg.bg} ${statusCfg.color}`}>
                                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                                    {statusCfg.label}
                                </div>
                            </div>

                            <div className="p-5 sm:p-6 space-y-6">
                                
                                {/* APPLICANT VIEW */}
                                {isApplicant && (
                                    <div className="space-y-6">
                                        {status === 'approved' && (
                                            <div className="flex flex-col items-center text-center space-y-4">
                                                <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-500 shadow-sm">
                                                    <CheckCircle2 size={28} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-base font-black uppercase tracking-tight text-foreground">Access Granted!</h4>
                                                    <p className="text-xs text-muted-foreground leading-normal max-w-xs mx-auto">Your application is approved. Scan this entry pass at the venue gates.</p>
                                                </div>

                                                <div className="bg-white p-3.5 rounded-sm shadow-sm border border-zinc-200">
                                                    <img 
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${window.location.origin}/applications/p/${application._id}`} 
                                                        alt="Entry Pass QR" 
                                                        className="w-36 h-36"
                                                    />
                                                </div>
                                                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Digital Entry Pass</p>

                                                <div className="pt-2 w-full flex flex-col gap-2">
                                                    <Button asChild className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm">
                                                        <Link href={`/events/${event._id}`}>
                                                            Book Tickets Now
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {status === 'rejected' && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-sm flex items-start gap-3">
                                                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                                    <div className="space-y-1">
                                                        <h4 className="text-xs font-bold text-red-500 uppercase tracking-wide">Application Not Approved</h4>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">Unfortunately, the event organizer was unable to approve your application.</p>
                                                    </div>
                                                </div>

                                                {application.rejectionReason && (
                                                    <div className="bg-muted/40 p-4 rounded-sm border border-border">
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Reason provided</p>
                                                        <p className="text-xs text-foreground font-semibold leading-normal">{application.rejectionReason}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {status === 'completed' && (
                                            <div className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-sm text-center space-y-4">
                                                <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400 mx-auto animate-pulse">
                                                    <Clock size={24} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-bold uppercase tracking-tight text-foreground">Under Evaluation</h4>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">The event host is currently auditing application submittals. You will be notified immediately upon approval.</p>
                                                </div>
                                            </div>
                                        )}

                                        {status === 'pending_form' && (
                                            <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-sm text-center space-y-4">
                                                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400 mx-auto">
                                                    <Clock size={24} />
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-bold uppercase tracking-tight text-foreground">Form Reset / Incomplete</h4>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">Your application needs attention. Please correct the entries as requested by the organizer.</p>
                                                </div>
                                                <Button asChild className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm">
                                                    <Link href={`/u/events/${event._id}/apply`}>
                                                        Complete Form Entries
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ORGANIZER / ADMIN CONTROL VIEW */}
                                {(isAdminOrDev || isEventOrganizer) && (
                                    <div className="space-y-4">
                                        <div className="bg-muted/40 p-4 rounded-sm border border-border text-xs space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Applicant:</span>
                                                <span className="font-bold text-foreground">{user.firstName} {user.lastName}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground">Payment Status:</span>
                                                <span className="font-bold text-foreground uppercase text-[10px] bg-muted px-1.5 py-0.5 rounded-xs border border-border">{application.paymentStatus}</span>
                                            </div>
                                            {application.submittedAt && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground">Submitted:</span>
                                                    <span className="font-bold text-foreground">{format(new Date(application.submittedAt), 'yyyy-MM-dd')}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2.5 pt-2">
                                            <Button 
                                                onClick={() => handleUpdateStatus('approved')}
                                                disabled={updating || status === 'approved'}
                                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-xs tracking-wider rounded-sm transition-all shadow-sm disabled:opacity-40"
                                            >
                                                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                                                Approve Application
                                            </Button>

                                            <Button 
                                                onClick={() => setResetModalOpen(true)}
                                                disabled={updating || status === 'pending_form'}
                                                variant="outline"
                                                className="w-full h-11 border-blue-500/50 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white font-bold uppercase text-xs tracking-wider rounded-sm transition-all disabled:opacity-40"
                                            >
                                                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                                                Reset Form Entries
                                            </Button>

                                            <Button 
                                                onClick={() => setRejectionModalOpen(true)}
                                                disabled={updating || status === 'rejected'}
                                                variant="outline"
                                                className="w-full h-11 border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white font-bold uppercase text-xs tracking-wider rounded-sm transition-all disabled:opacity-40"
                                            >
                                                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                                                Reject Application
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                </div>
            </div>

            {/* REJECTION REASON MODAL */}
            <Dialog open={rejectionModalOpen} onOpenChange={setRejectionModalOpen}>
                <DialogContent className="bg-card border border-border dark:border-zinc-800 text-card-foreground sm:max-w-md rounded-sm shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold uppercase tracking-tight text-foreground">Reject Application</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs">
                            Please provide a brief justification to the applicant explaining why their request is rejected.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-3">
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. Applicant photo does not meet minimum lighting standards..."
                            className="w-full h-32 bg-background border border-border dark:border-zinc-700 rounded-sm p-3.5 text-xs text-foreground focus:border-red-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button variant="ghost" onClick={() => setRejectionModalOpen(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase rounded-sm">Cancel</Button>
                        <Button 
                            variant="destructive" 
                            className="font-bold rounded-sm text-xs uppercase h-10 px-5"
                            disabled={!rejectionReason.trim() || updating}
                            onClick={() => handleUpdateStatus('rejected', rejectionReason)}
                        >
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* RESET FORM ENTRIES MODAL */}
            <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
                <DialogContent className="bg-card border border-border dark:border-zinc-800 text-card-foreground sm:max-w-md rounded-sm shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold uppercase tracking-tight text-blue-600 dark:text-blue-400">Reset Application Form</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs">
                            This will clear the custom form answers and headshot, allowing the user to re-submit. Provide explicit instructions on what they need to fix.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-3">
                        <textarea
                            value={resetReason}
                            onChange={(e) => setResetReason(e.target.value)}
                            placeholder="e.g. Please re-upload a clearer face shot and double-check your phone number entry..."
                            className="w-full h-32 bg-background border border-border dark:border-zinc-700 rounded-sm p-3.5 text-xs text-foreground focus:border-blue-500 outline-none transition-all resize-none"
                        />
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button variant="ghost" onClick={() => setResetModalOpen(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase rounded-sm">Cancel</Button>
                        <Button 
                            className="font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-xs uppercase h-10 px-5 shadow-sm"
                            disabled={!resetReason.trim() || updating}
                            onClick={() => handleUpdateStatus('pending_form', resetReason)}
                        >
                            Reset Form Entries
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}

