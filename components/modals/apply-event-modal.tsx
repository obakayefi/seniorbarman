"use client"
import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import api from "@/lib/axios"
import { toast } from "sonner"
import { useApp } from "@/context/AppContext"
import { CreditCard, FileText, CheckCircle, ChevronRight } from "lucide-react"

interface ApplyEventModalProps {
    event: any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    applicationStatus: any
    onSuccess: () => void
}

export function ApplyEventModal({ event, isOpen, onOpenChange, applicationStatus, onSuccess }: ApplyEventModalProps) {
    const { user } = useApp()
    const [step, setStep] = useState(1) // 1: Info/Pay, 2: Form, 3: Success
    const [loading, setLoading] = useState(false)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [photo, setPhoto] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    
    // Initialize based on status
    useEffect(() => {
        if (!isOpen) return;
        
        if (!applicationStatus) {
            setStep(1); // Start
        } else if (applicationStatus.status === "pending_payment") {
            setStep(1); // Needs to pay
        } else if (applicationStatus.status === "pending_form") {
            setStep(2); // Needs to fill form
        } else if (applicationStatus.status === "completed" || applicationStatus.status === "approved" || applicationStatus.status === "rejected") {
            setStep(3); // Already submitted
            // Load answers
            const ansMap: Record<string, any> = {};
            applicationStatus.formAnswers?.forEach((a: any) => {
                ansMap[a.fieldLabel] = a.answer;
            });
            setAnswers(ansMap);
            if (applicationStatus.applicantPicture) {
                setPhotoPreview(applicationStatus.applicantPicture);
            }
        }
    }, [isOpen, applicationStatus])

    const handleApplyOrPay = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/events/${event._id}/apply`, {
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
                onSuccess(); // Refresh parent status
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
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

    const submitForm = async () => {
        try {
            setLoading(true)
            // Format answers
            const formattedAnswers = Object.keys(answers).map(label => {
                const field = event.formFields.find((f: any) => f.label === label);
                return {
                    fieldLabel: label,
                    fieldType: field?.type || "text",
                    answer: answers[label]
                }
            });

            const formData = new FormData();
            formData.append('formAnswers', JSON.stringify(formattedAnswers));
            if (photo) {
                formData.append('applicantPicture', photo);
            }

            const res = await fetch(`/api/events/${event._id}/apply`, {
                method: 'PATCH',
                body: formData
            })
            
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to submit form")
            
            toast.success("Application submitted successfully!")
            onOpenChange(false); // Close the modal
            onSuccess(); // Refresh parent
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const renderField = (field: any) => {
        const value = answers[field.label] || "";
        const isReadonly = step === 3;

        return (
            <div key={field.label} className="space-y-2">
                <Label className="text-zinc-300 font-bold">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                
                {field.type === "text" && (
                    <Input 
                        value={value} 
                        onChange={(e) => handleAnswerChange(field.label, e.target.value)} 
                        disabled={isReadonly}
                        className="bg-zinc-900 border-zinc-800 text-white"
                        required={field.required}
                    />
                )}
                
                {field.type === "radio" && (
                    <div className="space-y-2 mt-2">
                        {field.options?.map((opt: string) => (
                            <label key={opt} className={`flex items-center gap-2 text-sm text-zinc-400 ${isReadonly ? "cursor-default" : "cursor-pointer"}`}>
                                <input 
                                    type="radio" 
                                    name={field.label} 
                                    value={opt}
                                    checked={value === opt}
                                    onChange={(e) => handleAnswerChange(field.label, e.target.value)}
                                    disabled={isReadonly}
                                    className="accent-orange-500 h-4 w-4"
                                    required={field.required && !value} // Basic validation
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                )}
                
                {field.type === "checkbox" && (
                    <div className="space-y-2 mt-2">
                        {field.options?.map((opt: string) => (
                            <label key={opt} className={`flex items-center gap-2 text-sm text-zinc-400 ${isReadonly ? "cursor-default" : "cursor-pointer"}`}>
                                <input 
                                    type="checkbox" 
                                    value={opt}
                                    checked={(answers[field.label] || []).includes(opt)}
                                    onChange={(e) => handleAnswerChange(field.label, e.target.value, true)}
                                    disabled={isReadonly}
                                    className="accent-orange-500 h-4 w-4 rounded"
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">
                        {step === 1 && "Start Application"}
                        {step === 2 && "Application Form"}
                        {step === 3 && "Application Status"}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        {event?.type === 'sports' ? `${event?.homeTeam?.name || event?.homeTeam} vs ${event?.awayTeam?.name || event?.awayTeam}` : event?.title}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mb-8 px-2">
                        {[
                            { s: 1, label: "Access", icon: <CreditCard size={14} /> },
                            { s: 2, label: "Details", icon: <FileText size={14} /> },
                            { s: 3, label: "Status", icon: <CheckCircle size={14} /> }
                        ].map((item, idx) => (
                            <React.Fragment key={item.s}>
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                                        step >= item.s 
                                            ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]" 
                                            : "bg-zinc-800 text-zinc-500"
                                    }`}>
                                        {item.icon}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                        step >= item.s ? "text-orange-500" : "text-zinc-600"
                                    }`}>
                                        {item.label}
                                    </span>
                                </div>
                                {idx < 2 && (
                                    <div className={`flex-1 h-[2px] mb-6 transition-all duration-500 ${
                                        step > item.s ? "bg-orange-500" : "bg-zinc-800"
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* STEP 1: Info & Payment */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                                <div className="relative bg-zinc-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/5 space-y-4">
                                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-2">
                                        <CreditCard size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-white uppercase tracking-tight">Application Access</h4>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            This is a private event. 
                                            {event.applicationFee > 0 
                                                ? ` To maintain the quality of attendees, an application fee of ₦${event.applicationFee.toLocaleString()} is required.`
                                                : ` Please complete the short application form to be considered for an invite.`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {applicationStatus?.status === "pending_payment" && (
                                <div className="flex items-center gap-3 text-amber-500 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-sm font-medium animate-pulse">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <span>You have a pending payment. Please complete it to unlock the form.</span>
                                </div>
                            )}

                            <Button 
                                onClick={handleApplyOrPay} 
                                disabled={loading}
                                className="w-full h-14 bg-orange-500 hover:bg-white text-white hover:text-black font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_30px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ChevronRight className="mr-2 h-5 w-5" />}
                                {event.applicationFee > 0 ? `Pay ₦${event.applicationFee.toLocaleString()} & Continue` : "Start Application"}
                            </Button>
                        </div>
                    )}

                    {/* STEP 2: Fill Form */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-6">
                                {event.requestPicture && (
                                    <div className="space-y-4 p-4 bg-zinc-900 border border-white/5 rounded-2xl">
                                        <Label className="text-zinc-300 font-bold uppercase tracking-widest text-[10px]">
                                            Applicant Photo {photo ? "" : <span className="text-red-500">*</span>}
                                        </Label>
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative h-32 w-32 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center">
                                                {photoPreview ? (
                                                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-zinc-600">
                                                        <Loader2 size={24} />
                                                        <span className="text-[10px] font-black uppercase tracking-tighter">No Photo</span>
                                                    </div>
                                                )}
                                            </div>
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
                                                id="photo-upload" 
                                            />
                                            <Button 
                                                asChild 
                                                variant="outline" 
                                                className="w-full border-zinc-800 text-[10px] font-black uppercase tracking-widest h-10"
                                            >
                                                <label htmlFor="photo-upload" className="cursor-pointer">
                                                    {photo ? "Change Photo" : "Upload Headshot"}
                                                </label>
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {event.formFields?.length > 0 ? (
                                    event.formFields.map(renderField)
                                ) : (
                                    <div className="text-center py-10 bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
                                        <p className="text-zinc-500 text-sm font-medium">No specific questions for this event.</p>
                                        <p className="text-[10px] text-zinc-600 uppercase mt-1">Just hit submit to finalize</p>
                                    </div>
                                )}
                            </div>
                            
                            <Button 
                                onClick={submitForm} 
                                disabled={loading || (event.requestPicture && !photo)}
                                className="w-full h-14 bg-orange-500 hover:bg-white text-white hover:text-black font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_30px_rgba(249,115,22,0.3)]"
                            >
                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                                Submit Application
                            </Button>
                        </div>
                    )}

                    {/* STEP 3: Completed/Readonly */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in zoom-in-95 duration-500">
                            <div className={`relative group p-8 rounded-3xl border border-white/5 text-center space-y-4 overflow-hidden`}>
                                {/* Background glow based on status */}
                                <div className={`absolute inset-0 opacity-10 ${
                                    applicationStatus?.status === "approved" ? "bg-green-500" :
                                    applicationStatus?.status === "rejected" ? "bg-red-500" : "bg-blue-500"
                                }`} />
                                
                                <div className="relative z-10 flex flex-col items-center">
                                    {applicationStatus?.status === "approved" ? (
                                        <>
                                            <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                                <CheckCircle2 size={40} />
                                            </div>
                                            <h3 className="font-black text-2xl text-white uppercase tracking-tight">Approved!</h3>
                                            <p className="text-sm text-zinc-400 max-w-[200px] mb-6">You have been granted access to this event.</p>

                                            {/* QR Code Section */}
                                            <div className="bg-white p-4 rounded-3xl mb-4 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                                                <img 
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${window.location.origin}/applications/p/${applicationStatus._id}`} 
                                                    alt="Entry QR Code" 
                                                    className="w-48 h-48"
                                                />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Digital Entry Pass</p>
                                            <p className="text-[9px] text-zinc-600 font-mono mb-2">ID: {applicationStatus._id}</p>
                                        </>
                                    ) : applicationStatus?.status === "rejected" ? (
                                        <>
                                            <div className="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                                <AlertCircle size={40} />
                                            </div>
                                            <h3 className="font-black text-2xl text-white uppercase tracking-tight">Not Approved</h3>
                                            <p className="text-sm text-zinc-400 max-w-[200px] mb-4">Unfortunately, you cannot attend this event.</p>
                                            
                                            {applicationStatus?.rejectionReason && (
                                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 max-w-sm w-full text-left">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Reason</p>
                                                    <p className="text-sm text-white font-medium">{applicationStatus.rejectionReason}</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-20 w-20 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 mb-4 shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-pulse">
                                                <Loader2 size={40} className="animate-spin" />
                                            </div>
                                            <h3 className="font-black text-2xl text-white uppercase tracking-tight">Under Review</h3>
                                            <p className="text-sm text-zinc-400">The organizer is curating the guestlist. We'll notify you soon!</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {(event.formFields?.length > 0 || photoPreview) && (
                                <div className="space-y-6 pt-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <div className="h-px flex-1 bg-zinc-800" />
                                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Application Summary</h4>
                                        <div className="h-px flex-1 bg-zinc-800" />
                                    </div>
                                    <div className="space-y-6 px-2">
                                        {photoPreview && (
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Submitted Photo</p>
                                                <div className="h-40 w-40 rounded-2xl overflow-hidden border border-white/10">
                                                    <img src={photoPreview} alt="Submitted" className="h-full w-full object-cover" />
                                                </div>
                                            </div>
                                        )}
                                        {event.formFields?.map(renderField)}
                                    </div>
                                </div>
                            )}

                            <Button 
                                onClick={() => onOpenChange(false)} 
                                variant="outline"
                                className="w-full h-14 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 font-black transition-all"
                            >
                                Close Window
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
