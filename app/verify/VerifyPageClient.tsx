"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { sitemap } from "@/lib/utils";
import {
    CheckCircle2, XCircle, Clock, Loader2,
    Ticket, ClipboardList, ArrowRight, Home,
    Badge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplyEventModal } from "@/components/modals/apply-event-modal";

type VerifyStatus = "loading" | "success" | "pending" | "failed";
type PaymentType = "ticket" | "event_application";
type TicketGenStatus = "idle" | "generating" | "done" | "failed";

export default function VerifyPageClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const reference = searchParams.get("reference");

    const [status, setStatus] = useState<VerifyStatus>("loading");
    const [paymentType, setPaymentType] = useState<PaymentType>("ticket");
    const [ticketGenStatus, setTicketGenStatus] = useState<TicketGenStatus>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    // Ticket flow state
    const [generatedTickets, setGeneratedTickets] = useState<any[]>([]);

    // Application flow state
    const [eventId, setEventId] = useState<string | null>(null);
    const [eventTitle, setEventTitle] = useState<string | null>(null);
    const [applicationStatus, setApplicationStatus] = useState<any>(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [eventData, setEventData] = useState<any>(null);

    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 5;

    useEffect(() => {
        if (!reference) {
            setStatus("failed");
            setErrorMsg("No payment reference found.");
            return;
        }

        const verify = async () => {
            try {
                // Only show initial loading on first attempt
                if (retryCount === 0) setStatus("loading");

                const v = await fetch(`/api/payment/verify?reference=${reference}`).then(r => r.json());
                const type: PaymentType = v.type || "ticket";
                setPaymentType(type);

                if (v.status === "success") {
                    setStatus("success");

                    if (type === "ticket") {
                        setTicketGenStatus("generating");
                        const order = await fetch(`/api/ticket-order?reference=${reference}`).then(r => r.json());

                        if (order.error || !order.createdTickets) {
                            setErrorMsg(order.error || "Tickets could not be generated.");
                            setTicketGenStatus("failed");
                            return;
                        }
                        setGeneratedTickets(order.createdTickets || []);
                        setTicketGenStatus("done");

                    } else if (type === "event_application") {
                        const eid = v.eventId;
                        setEventId(eid);
                        setEventTitle(v.eventTitle || "the event");

                        if (eid) {
                            const [evtRes, appRes] = await Promise.all([
                                fetch(`/api/events/${eid}`).then(r => r.json()),
                                fetch(`/api/events/${eid}/apply`).then(r => r.json()),
                            ]);
                            setEventData(evtRes);
                            if (appRes.application) {
                                setApplicationStatus(appRes.application);
                            }
                        }
                    }
                    return; // Terminal state reached
                }

                // If pending, schedule a retry
                if ((v.status === "pending" || v.status === "ongoing" || v.status === "processing") && retryCount < MAX_RETRIES) {
                    setStatus("pending");
                    const delays = [3000, 5000, 7000, 10000, 15000];
                    const nextDelay = delays[retryCount] || 5000;

                    console.log(`[VERIFY] Status pending. Retrying in ${nextDelay}ms (Attempt ${retryCount + 1}/${MAX_RETRIES})`);

                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                    }, nextDelay);
                } else {
                    // Out of retries or actual failure
                    setStatus(v.status === "pending" ? "pending" : "failed");
                    if (v.error) setErrorMsg(v.error);
                }

            } catch (err: any) {
                console.error("Verification polling error:", err);
                setStatus("failed");
                setErrorMsg(err.message || "An unexpected error occurred during verification.");
            }
        };

        verify();
    }, [reference, retryCount]);

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
            <div className="w-full max-w-lg space-y-6">

                {/* ── LOADING ── */}
                {status === "loading" && (
                    <div className="flex flex-col items-center gap-6 py-20">
                        <div className="h-20 w-20 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Loader2 size={40} className="text-orange-500 animate-spin" />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-black text-white">Verifying Payment</h2>
                            <p className="text-zinc-500 text-sm">Please wait while we confirm your transaction…</p>
                        </div>
                    </div>
                )}

                {/* ── PENDING ── */}
                {status === "pending" && (
                    <div className="bg-zinc-900/50 border-2 border-yellow-500/50 rounded-[2.5rem] p-10 flex flex-col items-center gap-8 text-center backdrop-blur-xl shadow-[0_20px_50px_rgba(234,179,8,0.1)]">
                        <div className="h-24 w-24 rounded-full bg-yellow-500/20 flex items-center justify-center border-2 border-yellow-500/30 animate-pulse">
                            <Clock size={48} className="text-yellow-500" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black text-yellow-500 uppercase tracking-tighter italic">Payment Pending</h2>
                            <p className="text-zinc-400 text-sm max-w-sm">
                                {retryCount > 0
                                    ? `We're still waiting for the bank to confirm (Attempt ${retryCount}/${MAX_RETRIES}). Please don't refresh.`
                                    : "Waiting for confirmation from Paystack. This usually resolves within a few seconds."}
                            </p>
                        </div>
                        <Button asChild variant="outline" className="h-14 px-8 border-zinc-800 text-white hover:bg-white hover:text-black font-black rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg">
                            <Link href="/"><Home size={18} className="mr-2" />Go Home</Link>
                        </Button>
                    </div>
                )}

                {/* ── FAILED ── */}
                {status === "failed" && (
                    <div className="bg-zinc-900/50 border-2 border-red-500/50 rounded-[2.5rem] p-10 flex flex-col items-center gap-8 text-center backdrop-blur-xl shadow-[0_20px_50px_rgba(239,68,68,0.1)]">
                        <div className="h-24 w-24 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500/30">
                            <XCircle size={48} className="text-red-500" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black text-red-500 uppercase tracking-tighter italic">Payment Failed</h2>
                            <p className="text-zinc-400 text-sm max-w-sm">{errorMsg || "We could not verify your payment. Please contact support if you were charged."}</p>
                        </div>
                        <Button asChild variant="outline" className="h-14 px-8 border-zinc-800 text-white hover:bg-white hover:text-black font-black rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg">
                            <Link href="/"><Home size={18} className="mr-2" />Go Home</Link>
                        </Button>
                    </div>
                )}

                {/* ── SUCCESS: TICKET FLOW ── */}
                {status === "success" && paymentType === "ticket" && (
                    <div className="bg-zinc-900/50 border-2 border-green-500/30 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(34,197,94,0.1)]">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500/30">
                                <CheckCircle2 size={48} className="text-green-500" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Payment Confirmed!</h2>
                                <p className="text-zinc-500 text-sm">Your ticket order is being processed.</p>
                            </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-8 space-y-6">
                            {ticketGenStatus === "generating" && (
                                <div className="flex flex-col items-center justify-center gap-4 py-4">
                                    <Loader2 size={32} className="animate-spin text-orange-500" />
                                    <span className="text-sm font-black uppercase tracking-widest text-orange-500/70">Generating your tickets…</span>
                                </div>
                            )}

                            {ticketGenStatus === "done" && (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">
                                            {generatedTickets.length} ticket{generatedTickets.length !== 1 ? "s" : ""} secured
                                        </p>

                                        {generatedTickets.length > 0 && (
                                            <div className="space-y-2 max-h-48 overflow-auto pr-1">
                                                {generatedTickets.map((t: any, i: number) => (
                                                    <div key={i} className="flex items-center justify-between bg-white/[0.03] rounded-2xl px-5 py-4 border border-white/5 group hover:border-orange-500/30 transition-all duration-300">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-black transition-all">
                                                                <Ticket size={20} className="text-orange-500 group-hover:text-black" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-white uppercase tracking-tight">{t.stand || t.ticketType || "Ticket"}</p>
                                                                <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">REF: {t.ticketNumber?.slice(-8)}</p>
                                                            </div>
                                                        </div>
                                                        <Badge className="bg-green-500/10 text-green-500 border-none text-[9px] font-black uppercase px-3 py-1">Valid</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-orange-500/5 border border-orange-500/10 p-4 rounded-2xl">
                                        <p className="text-xs text-zinc-400 text-center leading-relaxed font-medium">
                                            Your tickets have been saved securely. You can access them anytime from your <strong className="text-white">Dashboard</strong>.
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() => router.push(sitemap.user.tickets)}
                                        className="w-full h-16 bg-orange-500 hover:bg-white text-black font-black rounded-2xl text-lg uppercase tracking-tighter transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_10px_30px_rgba(249,115,22,0.3)]"
                                    >
                                        View My Tickets <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                </div>
                            )}

                            {ticketGenStatus === "failed" && (
                                <div className="space-y-6 text-center">
                                    <div className="p-6 bg-red-500/5 border-2 border-red-500/20 rounded-[2rem] space-y-3">
                                        <p className="text-base text-red-500 font-black uppercase italic tracking-tight">Manual Generation Required</p>
                                        <p className="text-xs text-zinc-500 leading-relaxed">{errorMsg || "Don't worry — your payment is confirmed. Please contact support with your reference:"}</p>
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5 font-mono text-orange-500 text-xs tracking-widest select-all">
                                            {reference}
                                        </div>
                                    </div>
                                    <Button asChild variant="outline" className="h-14 border-zinc-800 text-white w-full font-black rounded-2xl hover:bg-white hover:text-black transition-all">
                                        <Link href={sitemap.user.dashboard}>Go to Dashboard</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── SUCCESS: APPLICATION FLOW ── */}
                {status === "success" && paymentType === "event_application" && (
                    <div className="bg-zinc-900/50 border-2 border-blue-500/30 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(59,130,246,0.1)]">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="h-24 w-24 rounded-full bg-blue-500/20 flex items-center justify-center border-2 border-blue-500/30">
                                <CheckCircle2 size={48} className="text-blue-500" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Application Fee Paid!</h2>
                                <p className="text-zinc-500 text-sm">You now have access to the application form for:</p>
                                <p className="text-orange-500 font-black text-lg mt-2 uppercase tracking-tight">{eventTitle}</p>
                            </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-8 space-y-6">
                            <div className="bg-blue-500/5 border-2 border-blue-500/10 rounded-2xl p-5 space-y-1.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Next Step</p>
                                <p className="text-sm text-zinc-400 leading-relaxed font-medium">Complete your application by filling out the form. The organizer will review it and notify you of their decision.</p>
                            </div>

                            {eventData && (
                                <Button
                                    asChild
                                    className="w-full h-16 bg-blue-600 hover:bg-white text-white hover:text-black font-black rounded-2xl text-lg uppercase tracking-tighter transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_10px_30px_rgba(37,99,235,0.3)]"
                                >
                                    <Link href={`/u/events/${eventId}/apply`}>
                                        <ClipboardList size={22} className="mr-2" />
                                        Open Application Form
                                    </Link>
                                </Button>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="flex-1 h-14 border-zinc-800 text-zinc-400 hover:bg-white hover:text-black font-black rounded-2xl transition-all duration-300"
                                >
                                    <Link href="/u/applications">
                                        Applications
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="flex-1 h-14 border-zinc-800 text-zinc-400 hover:bg-white hover:text-black font-black rounded-2xl transition-all duration-300"
                                >
                                    <Link href={sitemap.user.dashboard}>
                                        Dashboard
                                    </Link>
                                </Button>
                            </div>

                            <p className="text-[10px] text-zinc-600 text-center uppercase font-bold tracking-widest opacity-50">
                                You can also access this later from <strong className="text-zinc-400">My Applications</strong>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
