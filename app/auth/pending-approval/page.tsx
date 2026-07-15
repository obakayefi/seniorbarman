"use client"
import { useRouter } from "next/navigation"
import { Clock, CheckCircle, Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PendingApprovalPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Animated glow backdrop */}
                <div className="relative">
                    <div className="absolute inset-0 bg-orange-500/10 blur-3xl rounded-full scale-150 pointer-events-none" />

                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-[0_32px_64px_0_rgba(0,0,0,0.6)] text-center space-y-8">
                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                                    <Clock className="w-12 h-12 text-orange-400" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-2 border-[#020202] flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Copy */}
                        <div className="space-y-3">
                            <h1 className="text-2xl font-black text-white tracking-tight">
                                Application Submitted!
                            </h1>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Your provider account request has been received and is currently under review by our admin team.
                            </p>
                        </div>

                        {/* What to expect */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-4">
                            <p className="text-zinc-300 font-bold text-sm uppercase tracking-widest">What happens next?</p>
                            <div className="space-y-3">
                                {[
                                    { icon: Clock, label: "Your request is now pending review", sub: "Typically reviewed within 24–48 hours." },
                                    { icon: Mail, label: "You'll be notified by email", sub: "Keep an eye on your inbox for approval or feedback." },
                                    { icon: CheckCircle, label: "Access is granted on approval", sub: "Your role will be updated and you can start immediately." },
                                ].map(({ icon: Icon, label, sub }) => (
                                    <div key={label} className="flex items-start gap-3">
                                        <div className="p-1.5 rounded-lg bg-orange-500/10 mt-0.5 shrink-0">
                                            <Icon className="w-3.5 h-3.5 text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-white text-xs font-semibold">{label}</p>
                                            <p className="text-zinc-500 text-[11px]">{sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <Button
                            onClick={() => router.push('/auth/login')}
                            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold border-0 h-12 rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all duration-300 flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Login
                        </Button>

                        <p className="text-zinc-600 text-xs">
                            Already approved? Log in to access your new role.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
