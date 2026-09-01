"use client"
import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, CheckCircle2, AlertCircle, CreditCard, FileText, CheckCircle, ChevronLeft, ChevronRight, Upload } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import api from "@/lib/axios"
import { useApp } from "@/context/AppContext"

export default function ApplyPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const { user } = useApp()

    const [event, setEvent] = useState<any>(null)
    const [applicationStatus, setApplicationStatus] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [step, setStep] = useState(1) // 1: Info/Pay, 2: Form, 3: Success

    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [photo, setPhoto] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)

    const fetchInitialData = async () => {
        try {
            setLoading(true)
            // Fetch event details
            const eventRes = await api.get(`/events/${id}`)
            setEvent(eventRes.data)

            if (!eventRes.data.requiresApplication) {
                toast.error("This event does not require an application.")
                router.push(`/events/${id}`)
                return
            }

            // Fetch current user application status
            const appRes = await api.get(`/events/${id}/apply`)
            const app = appRes.data.application

            if (app) {
                setApplicationStatus(app)
                if (["completed", "approved", "rejected"].includes(app.status)) {
                    // Redirect to the submission view page
                    router.push(`/u/applications/${app._id}`)
                    return
                } else if (app.status === "pending_payment") {
                    setStep(1)
                } else if (app.status === "pending_form") {
                    setStep(2)
                }
            } else {
                setStep(1)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load application page")
            router.push(`/events/${id}`)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            fetchInitialData()
        }
    }, [id])

    const handleApplyOrPay = async () => {
        try {
            setSubmitting(true)
            const res = await fetch(`/api/events/${id}/apply`, {
                method: 'POST'
            })
            const data = await res.json()
            
            if (!res.ok) throw new Error(data.error || "Failed to start application")
            
            if (data.paymentUrl) {
                // Redirect to paystack
                window.location.href = data.paymentUrl;
            } else {
                // Free, move to form
                setStep(2);
                toast.success("Application access unlocked!");
                fetchInitialData();
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleAnswerChange = (label: string, value: any, isCheckbox: boolean = false) => {
        setAnswers(prev => {
            if (isCheckbox) {
                const current = prev[label] || [];
                if (current.includes(value)) {
                    return { ...prev, [label]: current.filter((v: string) => v !== value) };
                } else {
                    return { ...prev, [label]: [...current, value] };
                }
            }
            return { ...prev, [label]: value };
        });
    }

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true)
            
            // Format answers
            const formattedAnswers = Object.keys(answers).map(label => {
                const field = event.formFields.find((f: any) => f.label === label);
                return {
                    fieldLabel: label,
                    fieldType: field?.type || "text",
                    answer: answers[label]
                }
            });

            // Validate fields
            const requiredFields = (event?.formFields || []).filter((f: any) => f.required);
            for (const field of requiredFields) {
                const answer = formattedAnswers.find(a => a.fieldLabel === field.label);
                const isEmpty = !answer || answer.answer === undefined || answer.answer === "" || (Array.isArray(answer.answer) && answer.answer.length === 0);
                if (isEmpty) {
                    throw new Error(`"${field.label}" is required.`);
                }
            }

            if (event.requestPicture && !photo) {
                throw new Error("Applicant headshot is required.");
            }

            const formData = new FormData();
            formData.append('formAnswers', JSON.stringify(formattedAnswers));
            if (photo) {
                formData.append('applicantPicture', photo);
            }

            const res = await fetch(`/api/events/${id}/apply`, {
                method: 'PATCH',
                body: formData
            })
            
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to submit form")
            
            toast.success("Application submitted successfully!")
            router.push(`/u/applications/${data.application._id}`)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                <p className="text-lg font-medium">Preparing application environment...</p>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-muted-foreground gap-4">
                <p className="text-xl text-foreground font-bold">Event not found</p>
                <Button asChild variant="outline" className="border-border rounded-xl">
                    <Link href="/events">Explore Events</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            {/* Header background pattern */}
            <div className="relative h-64 w-full overflow-hidden border-b border-border bg-muted/20">
                <div className="absolute inset-0 bg-cover bg-center filter blur-lg opacity-25 scale-110" style={{ backgroundImage: `url(${event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop'})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                
                <div className="relative z-10 max-w-4xl mx-auto px-6 h-full flex flex-col justify-end pb-8 space-y-4">
                    <Link href={`/events/${id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium w-fit">
                        <ChevronLeft size={16} /> Back to Event Details
                    </Link>
                    
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-orange-500/10 border border-orange-500/20 text-orange-500 font-bold uppercase tracking-widest text-[10px] rounded-lg">
                                Application Portal
                            </Badge>
                            <span className="text-muted-foreground text-xs">Event Fee: {event.applicationFee > 0 ? `₦${event.applicationFee.toLocaleString()}` : 'FREE'}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-none uppercase italic">
                            {event.type === 'sports' ? `${event.homeTeam?.name || event.homeTeam} vs ${event.awayTeam?.name || event.awayTeam}` : event.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Application Flow Container */}
            <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-20">
                {/* Steps Header bar */}
                <Card className="bg-card/90 border-border backdrop-blur-2xl rounded-3xl p-6 mb-8 shadow-xl">
                    <div className="flex items-center justify-between px-4">
                        {[
                            { s: 1, label: "Access & Fee", icon: <CreditCard size={14} /> },
                            { s: 2, label: "Fill Details", icon: <FileText size={14} /> },
                            { s: 3, label: "Submit & Track", icon: <CheckCircle size={14} /> }
                        ].map((item, idx) => (
                            <React.Fragment key={item.s}>
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                        step >= item.s 
                                            ? "bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]" 
                                            : "bg-muted text-muted-foreground"
                                    }`}>
                                        {item.icon}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                        step >= item.s ? "text-orange-500" : "text-muted-foreground"
                                    }`}>
                                        {item.label}
                                    </span>
                                </div>
                                {idx < 2 && (
                                    <div className={`flex-1 h-[2px] mb-6 transition-all duration-500 ${
                                        step > item.s ? "bg-orange-500" : "bg-border"
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </Card>

                {/* STEP 1: Access Info and Payments */}
                {step === 1 && (
                    <Card className="bg-card border-border backdrop-blur-xl rounded-3xl p-8 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 shadow-xl">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black tracking-tight text-foreground uppercase italic">Access Authentication</h2>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Thank you for your interest in joining this event. Because of the exclusive nature of this activity, all attendees must complete an application. 
                                {event.applicationFee > 0 && ` An application fee of ₦${event.applicationFee.toLocaleString()} is required before you can access the form.`}
                            </p>
                        </div>

                        {applicationStatus?.status === "pending_payment" && (
                            <div className="flex items-center gap-3 text-amber-500 bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 text-sm font-semibold">
                                <AlertCircle size={20} className="shrink-0 animate-pulse text-amber-500" />
                                <span>We found a pending payment for your account. Please complete it using the checkout link to unlock the questionnaire.</span>
                            </div>
                        )}

                        <div className="bg-muted/40 p-6 rounded-2xl border border-border flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Type</p>
                                <p className="text-foreground font-black uppercase tracking-tight">{event.applicationFee > 0 ? "Paid Application" : "Free Invitation Form"}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fee</p>
                                <p className="text-2xl font-black text-orange-500">{event.applicationFee > 0 ? `₦${event.applicationFee.toLocaleString()}` : "FREE"}</p>
                            </div>
                        </div>

                        <Button 
                            onClick={handleApplyOrPay} 
                            disabled={submitting}
                            className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:scale-[1.01] active:scale-[0.99] rounded-2xl"
                        >
                            {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ChevronRight className="mr-2 h-5 w-5" />}
                            {event.applicationFee > 0 ? `Pay ₦${event.applicationFee.toLocaleString()} & Fill Form` : "Proceed to Invitation Form"}
                        </Button>
                    </Card>
                )}

                {/* STEP 2: Main Application Form */}
                {step === 2 && (
                    <form onSubmit={submitForm} className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-500">
                        {/* Photo Headshot Card */}
                        {event.requestPicture && (
                            <Card className="bg-card border-border backdrop-blur-xl rounded-3xl p-6 space-y-4 shadow-xl">
                                <div className="border-b border-border pb-3">
                                    <Label className="text-foreground font-black uppercase tracking-widest text-[11px] flex items-center gap-1.5">
                                        Headshot Upload <span className="text-red-500 font-bold">*</span>
                                    </Label>
                                    <CardDescription className="text-muted-foreground text-xs mt-1">Please provide a clear front-facing portrait photo of yourself.</CardDescription>
                                </div>
                                
                                <div className="flex flex-col md:flex-row items-center gap-6 py-2">
                                    <div className="relative h-36 w-36 rounded-3xl bg-muted border border-border overflow-hidden flex items-center justify-center shadow-inner shrink-0">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                                                <Upload size={28} />
                                                <span className="text-[10px] font-black uppercase tracking-tighter">No Preview</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 w-full space-y-3">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setPhoto(file);
                                                    setPhotoPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="hidden" 
                                            id="portrait-upload" 
                                        />
                                        <p className="text-muted-foreground text-[11px] leading-normal">
                                            Supported formats: JPG, PNG, WEBP. Max file size: 5MB. Ensure good lighting and a simple background.
                                        </p>
                                        <Button 
                                            asChild 
                                            variant="outline" 
                                            className="w-full md:w-auto border-border hover:bg-muted font-black uppercase tracking-widest text-[10px] h-11 rounded-2xl cursor-pointer"
                                        >
                                            <label htmlFor="portrait-upload">
                                                {photo ? "Replace Headshot" : "Upload Headshot Image"}
                                            </label>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Questions Card */}
                        <Card className="bg-card border-border backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                            <div className="border-b border-border pb-4 mb-2">
                                <h3 className="text-xl font-black text-foreground uppercase italic tracking-tight">Application Questions</h3>
                                <p className="text-muted-foreground text-xs mt-1">Please provide thorough and accurate responses to the questions below.</p>
                            </div>

                            {event.formFields?.length > 0 ? (
                                <div className="space-y-6">
                                    {event.formFields.map((field: any) => {
                                        const value = answers[field.label] || "";
                                        return (
                                            <div key={field.label} className="space-y-2">
                                                <Label className="text-foreground font-black uppercase text-[10px] tracking-widest flex items-center gap-1">
                                                    {field.label} {field.required && <span className="text-red-500 font-bold">*</span>}
                                                </Label>
                                                
                                                {field.type === "text" && (
                                                    <Input 
                                                        value={value} 
                                                        onChange={(e) => handleAnswerChange(field.label, e.target.value)} 
                                                        className="bg-background border-input text-foreground rounded-2xl h-12 focus:border-orange-500 transition-all font-medium"
                                                        placeholder="Enter your response..."
                                                        required={field.required}
                                                    />
                                                )}
                                                
                                                {field.type === "radio" && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                                        {field.options?.map((opt: string) => (
                                                            <label 
                                                                key={opt} 
                                                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm transition-all font-semibold cursor-pointer ${
                                                                    value === opt 
                                                                        ? "bg-orange-500/10 border-orange-500 text-orange-500 dark:text-orange-400" 
                                                                        : "bg-muted/30 border-border text-foreground hover:border-border/80"
                                                                }`}
                                                            >
                                                                <input 
                                                                    type="radio" 
                                                                    name={field.label} 
                                                                    value={opt}
                                                                    checked={value === opt}
                                                                    onChange={(e) => handleAnswerChange(field.label, e.target.value)}
                                                                    className="accent-orange-500 h-4 w-4 shrink-0"
                                                                    required={field.required && !value}
                                                                />
                                                                {opt}
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {field.type === "checkbox" && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                                        {field.options?.map((opt: string) => {
                                                            const isChecked = (answers[field.label] || []).includes(opt);
                                                            return (
                                                                <label 
                                                                    key={opt} 
                                                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm transition-all font-semibold cursor-pointer ${
                                                                        isChecked 
                                                                            ? "bg-orange-500/10 border-orange-500 text-orange-500 dark:text-orange-400" 
                                                                            : "bg-muted/30 border-border text-foreground hover:border-border/80"
                                                                    }`}
                                                                >
                                                                    <input 
                                                                        type="checkbox" 
                                                                        value={opt}
                                                                        checked={isChecked}
                                                                        onChange={(e) => handleAnswerChange(field.label, e.target.value, true)}
                                                                        className="accent-orange-500 h-4 w-4 rounded shrink-0"
                                                                    />
                                                                    {opt}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
                                    <p className="text-muted-foreground text-sm font-medium">No custom questions are required for this event.</p>
                                    <p className="text-[10px] text-muted-foreground uppercase mt-1">Just finalize your headshot and submit.</p>
                                </div>
                            )}
                        </Card>

                        {/* Submit Actions */}
                        <Button 
                            type="submit"
                            disabled={submitting || (event.requestPicture && !photo)}
                            className="w-full h-16 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:scale-[1.01] active:scale-[0.99] rounded-2xl"
                        >
                            {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                            Submit Form & Finalize Application
                        </Button>
                    </form>
                )}
            </div>
        </div>
    )
}
