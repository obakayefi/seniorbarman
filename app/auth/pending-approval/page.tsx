"use client"
import { useRouter } from "next/navigation"
import { Clock, CheckCircle2, Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PendingApprovalPage() {
    const router = useRouter()

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-card/95 dark:bg-zinc-950/90 backdrop-blur-md border border-border dark:border-zinc-800 rounded-sm p-6 sm:p-8 shadow-xl dark:shadow-black/40 text-center space-y-6 transition-all">
                {/* Icon */}
                <div className="flex justify-center pt-2">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-sm bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shadow-inner">
                            <Clock className="w-8 h-8 text-orange-500 animate-pulse" />
                        </div>
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-xs bg-emerald-500 border-2 border-card dark:border-zinc-950 flex items-center justify-center shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                    </div>
                </div>

                {/* Copy */}
                <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        Application Submitted
                    </h1>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Your provider account request has been received and is currently under review by the Senior Barman admin team.
                    </p>
                </div>

                {/* What to expect */}
                <div className="bg-muted/40 dark:bg-zinc-900/60 border border-border/70 dark:border-zinc-800 rounded-sm p-4 text-left space-y-3">
                    <p className="text-foreground/90 font-bold text-xs uppercase tracking-wider">What happens next?</p>
                    <div className="space-y-2.5">
                        {[
                            { icon: Clock, label: "Request pending review", sub: "Typically reviewed within 24 hours." },
                            { icon: Mail, label: "Notification via email", sub: "We will send an update when reviewed." },
                            { icon: CheckCircle2, label: "Instant access upon approval", sub: "Log in with your credentials to access your dashboard." },
                        ].map(({ icon: Icon, label, sub }) => (
                            <div key={label} className="flex items-start gap-3">
                                <div className="p-1.5 rounded-xs bg-orange-500/10 mt-0.5 shrink-0">
                                    <Icon className="w-3.5 h-3.5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-foreground text-xs font-semibold">{label}</p>
                                    <p className="text-muted-foreground text-[11px]">{sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="pt-2 space-y-3">
                    <Button
                        onClick={() => router.push('/auth/login')}
                        className="w-full h-10 rounded-sm bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Button>

                    <p className="text-muted-foreground text-[11px]">
                        Already approved? Log in to access your new management role.
                    </p>
                </div>
            </div>
        </div>
    )
}
