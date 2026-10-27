"use client";

import React, { useState, useRef } from "react";
import { useQRCode } from "next-qrcode";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Share2,
    Copy,
    Check,
    Loader2,
    Sparkles,
    Ticket as TicketIcon,
    Layers,
    LayoutGrid,
    Flame,
    ExternalLink,
    UserCheck,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBaseUrl, formatEventTime } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ComboDeckViewProps {
    comboGroup: {
        groupId: string;
        tickets: any[];
        ticketType: string;
        price: number;
        createdAt?: string;
    };
    eventInfo: any;
    user?: any;
    packIndex?: number;
    totalPacks?: number;
}

export default function ComboDeckView({
    comboGroup,
    eventInfo,
    user,
    packIndex = 0,
    totalPacks = 1,
}: ComboDeckViewProps) {
    const { groupId, tickets, ticketType, price } = comboGroup;
    const [activeIndex, setActiveIndex] = useState(0);
    const [viewLayout, setViewLayout] = useState<"deck" | "grid">("deck");
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [copiedPack, setCopiedPack] = useState(false);
    const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
    const [downloadingPack, setDownloadingPack] = useState(false);

    const ticketCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const { Image: QRImage } = useQRCode();

    const activeTicket = tickets[activeIndex] || tickets[0];
    const totalTickets = tickets.length;

    // Calculate scan progress
    const scannedCount = tickets.filter(t => t.isInside || t.checkInLogs?.some((l: any) => l.action === "checked-in")).length;
    const allScanned = scannedCount === totalTickets;

    const eventTitle = (eventInfo?.homeTeam?.name || eventInfo?.homeTeam)
        ? `${eventInfo.homeTeam?.name || eventInfo.homeTeam} vs ${eventInfo.awayTeam?.name || eventInfo.awayTeam}`
        : (eventInfo?.title || "Match Pass");

    const handleShareIndividual = (ticket: any, index: number) => {
        const passUrl = `${getBaseUrl()}/tickets/p/${ticket.checkInToken}`;
        navigator.clipboard.writeText(passUrl);
        setCopiedIndex(index);
        toast.success(`Pass #${index + 1} link copied! Send it to your guest.`);
        setTimeout(() => setCopiedIndex(null), 2500);
    };

    const handleSharePack = () => {
        const packUrl = `${getBaseUrl()}/u/tickets/${eventInfo._id}/combo/${groupId}`;
        navigator.clipboard.writeText(packUrl);
        setCopiedPack(true);
        toast.success("Combo pack link copied to clipboard!");
        setTimeout(() => setCopiedPack(false), 2500);
    };

    const handleDownloadSingle = async (ticket: any, index: number) => {
        const ref = ticketCardRefs.current[ticket._id];
        if (!ref) return;

        setDownloadingIndex(index);
        try {
            const dataUrl = await toPng(ref, { cacheBust: true, pixelRatio: 2 });
            const link = document.createElement("a");
            link.download = `combo-pass-${index + 1}-of-${totalTickets}-${ticket.ticketNumber || ticket._id.slice(-6)}.png`;
            link.href = dataUrl;
            link.click();
            toast.success(`Downloaded Pass #${index + 1}`);
        } catch (err) {
            console.error("Download error:", err);
            toast.error("Failed to download pass");
        } finally {
            setDownloadingIndex(null);
        }
    };

    const handleDownloadAll = async () => {
        setDownloadingPack(true);
        try {
            for (let i = 0; i < tickets.length; i++) {
                const t = tickets[i];
                const ref = ticketCardRefs.current[t._id];
                if (ref) {
                    const dataUrl = await toPng(ref, { cacheBust: true, pixelRatio: 2 });
                    const link = document.createElement("a");
                    link.download = `combo-pack-${i + 1}-of-${totalTickets}-${t.ticketNumber || t._id.slice(-6)}.png`;
                    link.href = dataUrl;
                    link.click();
                    await new Promise(r => setTimeout(r, 450));
                }
            }
            toast.success(`Successfully downloaded all ${totalTickets} passes!`);
        } catch (err) {
            console.error("Error downloading combo pack:", err);
            toast.error("Failed downloading some passes");
        } finally {
            setDownloadingPack(false);
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Header: Pack Info & Quick Controls */}
            <div className="w-full max-w-xl bg-card/60 backdrop-blur-md border border-border rounded-xl p-4 sm:p-5 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-sm">
                            <Layers size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">
                                    Pack {packIndex + 1} of {totalPacks}
                                </span>
                                <span className="text-[11px] font-mono text-muted-foreground">
                                    #{groupId.slice(0, 8)}
                                </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-black text-foreground uppercase tracking-tight mt-0.5">
                                {ticketType} &bull; {totalTickets} Entry Passes
                            </h3>
                        </div>
                    </div>

                    {/* View switcher & Action pill */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <div className="flex bg-muted/60 p-0.5 rounded-lg border border-border/80">
                            <button
                                type="button"
                                onClick={() => setViewLayout("deck")}
                                title="Deck / Gate Scan View"
                                className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${
                                    viewLayout === "deck"
                                        ? "bg-card text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Layers size={13} />
                                <span className="hidden xs:inline">Stack</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewLayout("grid")}
                                title="Fan Out / All Passes View"
                                className={`px-2.5 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${
                                    viewLayout === "grid"
                                        ? "bg-card text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <LayoutGrid size={13} />
                                <span className="hidden xs:inline">Fan Out</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress & Quick Batch Actions */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                            {tickets.map((t, idx) => {
                                const isUsed = t.isInside || t.checkInLogs?.some((l: any) => l.action === "checked-in");
                                return (
                                    <div
                                        key={t._id}
                                        title={`Pass #${idx + 1}: ${isUsed ? "Scanned" : "Ready"}`}
                                        className={`w-3.5 h-3.5 rounded-full border-2 border-card transition-all ${
                                            isUsed ? "bg-muted-foreground" : idx === activeIndex && viewLayout === "deck" ? "bg-orange-500 scale-125" : "bg-emerald-500"
                                        }`}
                                    />
                                );
                            })}
                        </div>
                        <span className="text-muted-foreground text-[11px] font-semibold">
                            {allScanned ? (
                                <span className="text-muted-foreground font-bold">All Passes Scanned</span>
                            ) : (
                                <span>
                                    <strong className="text-emerald-500">{totalTickets - scannedCount}</strong> of {totalTickets} Ready at Gate
                                </span>
                            )}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSharePack}
                            className="h-7 text-xs font-bold px-2.5 text-muted-foreground hover:text-foreground gap-1.5"
                        >
                            {copiedPack ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                            {copiedPack ? "Copied" : "Share Pack"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadAll}
                            disabled={downloadingPack}
                            className="h-7 text-xs font-bold px-2.5 border-border bg-card text-foreground hover:bg-muted gap-1.5"
                        >
                            {downloadingPack ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                            Download Pack
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── MODE 1: INTERACTIVE DECK (GATE FOCUS) ── */}
            {viewLayout === "deck" && (
                <div className="w-full flex flex-col items-center">
                    {/* Visual Deck Stage with Framer Motion cards */}
                    <div className="relative w-full max-w-[340px] sm:max-w-[360px] h-[540px] flex items-center justify-center mb-6">
                        <AnimatePresence initial={false} mode="popLayout">
                            {tickets.map((ticket, index) => {
                                // Only render active card and up to 2 peek cards behind it for smooth 3D depth
                                const offset = index - activeIndex;
                                if (offset < 0 || offset > 2) return null;

                                const isTop = offset === 0;
                                const isScanned = ticket.isInside || ticket.checkInLogs?.some((l: any) => l.action === "checked-in");

                                return (
                                    <motion.div
                                        key={ticket._id}
                                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                        animate={{
                                            opacity: 1 - offset * 0.15,
                                            y: offset * 14,
                                            scale: 1 - offset * 0.05,
                                            zIndex: 20 - offset,
                                        }}
                                        exit={{ opacity: 0, x: -120, rotate: -6 }}
                                        transition={{ duration: 0.28, ease: "easeInOut" }}
                                        className={`absolute top-0 w-full rounded-2xl border ${
                                            isTop
                                                ? "border-orange-500/40 shadow-xl shadow-orange-500/10"
                                                : "border-border shadow-md"
                                        } bg-card overflow-hidden select-none`}
                                    >
                                        <div
                                            ref={(el) => { ticketCardRefs.current[ticket._id] = el; }}
                                            className="p-5 flex flex-col items-center bg-card relative"
                                        >
                                            {/* Glow accent */}
                                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />

                                            {/* Ticket Card Top Band */}
                                            <div className="w-full flex items-center justify-between pt-1 pb-3 mb-3 border-b border-border/80">
                                                <div className="flex items-center gap-2">
                                                    <TicketIcon size={14} className="text-orange-500" />
                                                    <span className="text-xs font-black uppercase tracking-wider text-foreground">
                                                        Pass {index + 1} of {totalTickets}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                        isScanned
                                                            ? "bg-muted text-muted-foreground"
                                                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                    }`}
                                                >
                                                    {isScanned ? "Used / Scanned" : "Ready to Scan"}
                                                </span>
                                            </div>

                                            {/* Event Matchup / Title */}
                                            <div className="w-full text-center mb-3">
                                                <h4 className="text-sm font-black text-foreground truncate px-2">
                                                    {eventTitle}
                                                </h4>
                                                <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest">
                                                    {ticketType}
                                                </p>
                                            </div>

                                            {/* High Contrast QR Stage (Bright White background for flawless optical gate scanning) */}
                                            <div className="relative p-4 bg-white rounded-xl shadow-inner border border-zinc-200 mb-3 flex flex-col items-center">
                                                <QRImage
                                                    text={`${getBaseUrl()}/tickets/p/${ticket.checkInToken}`}
                                                    options={{
                                                        type: "image/jpeg",
                                                        quality: 0.35,
                                                        errorCorrectionLevel: "M",
                                                        margin: 1,
                                                        scale: 4,
                                                        width: 190,
                                                        color: {
                                                            dark: "#ea580c",
                                                            light: "#ffffff",
                                                        },
                                                    }}
                                                />
                                                <span className="mt-2 text-[9px] font-mono tracking-widest text-zinc-500 font-bold uppercase">
                                                    PRESENT AT TURNSTILE
                                                </span>
                                            </div>

                                            {/* Pass Code & Meta */}
                                            <div className="w-full text-center space-y-1 mb-2">
                                                <p className="text-xs font-mono font-black text-foreground tracking-widest">
                                                    {ticket.ticketNumber || `#${ticket._id.slice(-8)}`}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                                                    Holder: <span className="text-foreground font-bold">{ticket.holderName || "Guest"}</span> &bull; ₦{(price || 0).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Quick Individual Card Actions */}
                                            <div className="w-full grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-border">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShareIndividual(ticket, index);
                                                    }}
                                                    className="h-8 text-[11px] font-bold rounded-md border-border bg-card hover:bg-muted gap-1 text-foreground"
                                                >
                                                    {copiedIndex === index ? (
                                                        <Check size={12} className="text-emerald-500" />
                                                    ) : (
                                                        <Share2 size={12} />
                                                    )}
                                                    {copiedIndex === index ? "Link Copied" : "Send to Friend"}
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownloadSingle(ticket, index);
                                                    }}
                                                    disabled={downloadingIndex === index}
                                                    className="h-8 text-[11px] font-bold rounded-md border-border bg-card hover:bg-muted gap-1 text-foreground"
                                                >
                                                    {downloadingIndex === index ? (
                                                        <Loader2 size={12} className="animate-spin" />
                                                    ) : (
                                                        <Download size={12} />
                                                    )}
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Navigation Bar for Deck */}
                    <div className="w-full max-w-sm flex items-center justify-between gap-2 px-2 mt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
                            disabled={activeIndex === 0}
                            className="rounded-lg border-border h-10 px-4 font-bold text-xs gap-1.5"
                        >
                            <ChevronLeft size={16} /> Previous Pass
                        </Button>

                        {/* Page Dots */}
                        <div className="flex items-center gap-1.5">
                            {tickets.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveIndex(idx)}
                                    className={`h-2 rounded-full transition-all ${
                                        idx === activeIndex
                                            ? "w-6 bg-orange-500"
                                            : "w-2 bg-muted hover:bg-muted-foreground/40"
                                    }`}
                                    aria-label={`Jump to pass ${idx + 1}`}
                                />
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveIndex(prev => Math.min(totalTickets - 1, prev + 1))}
                            disabled={activeIndex === totalTickets - 1}
                            className="rounded-lg border-border h-10 px-4 font-bold text-xs gap-1.5"
                        >
                            Next Pass <ChevronRight size={16} />
                        </Button>
                    </div>

                    <p className="text-[11px] text-muted-foreground mt-4 text-center">
                        Gate tip: Keep this card active for the scanner. Tap <strong>Next Pass</strong> for your companion.
                    </p>
                </div>
            )}

            {/* ── MODE 2: FAN OUT GRID (OVERVIEW & PRINT) ── */}
            {viewLayout === "grid" && (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {tickets.map((ticket, index) => {
                        const isScanned = ticket.isInside || ticket.checkInLogs?.some((l: any) => l.action === "checked-in");
                        return (
                            <div
                                key={ticket._id}
                                className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-orange-500/40 transition-colors"
                            >
                                <div
                                    ref={(el) => { ticketCardRefs.current[ticket._id] = el; }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-border/80">
                                        <div className="flex items-center gap-1.5">
                                            <TicketIcon size={14} className="text-orange-500" />
                                            <span className="text-xs font-black uppercase text-foreground">
                                                Pass {index + 1} of {totalTickets}
                                            </span>
                                        </div>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                isScanned
                                                    ? "bg-muted text-muted-foreground"
                                                    : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                            }`}
                                        >
                                            {isScanned ? "Scanned" : "Ready"}
                                        </span>
                                    </div>

                                    <div className="bg-white p-3 rounded-xl shadow-inner border border-zinc-200 mb-3">
                                        <QRImage
                                            text={`${getBaseUrl()}/tickets/p/${ticket.checkInToken}`}
                                            options={{
                                                type: "image/jpeg",
                                                quality: 0.3,
                                                errorCorrectionLevel: "M",
                                                margin: 1,
                                                scale: 4,
                                                width: 160,
                                                color: {
                                                    dark: "#ea580c",
                                                    light: "#ffffff",
                                                },
                                            }}
                                        />
                                    </div>

                                    <div className="w-full text-center space-y-1 mb-2">
                                        <p className="text-xs font-mono font-bold text-foreground">
                                            {ticket.ticketNumber || `#${ticket._id.slice(-8)}`}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground uppercase font-semibold">
                                            {ticketType} &bull; ₦{(price || 0).toLocaleString()}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            Holder: {ticket.holderName || "Guest"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-3 mt-2 border-t border-border">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleShareIndividual(ticket, index)}
                                        className="h-8 text-[11px] font-bold rounded-md border-border bg-card hover:bg-muted gap-1 text-foreground"
                                    >
                                        {copiedIndex === index ? <Check size={12} className="text-emerald-500" /> : <Share2 size={12} />}
                                        {copiedIndex === index ? "Copied" : "Share"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownloadSingle(ticket, index)}
                                        disabled={downloadingIndex === index}
                                        className="h-8 text-[11px] font-bold rounded-md border-border bg-card hover:bg-muted gap-1 text-foreground"
                                    >
                                        {downloadingIndex === index ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                                        Save
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
