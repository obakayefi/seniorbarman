"use client"
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useQRCode } from "next-qrcode";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { 
    MoveLeft, 
    Share2, 
    Download, 
    Check, 
    Copy, 
    Loader2, 
    AlertCircle, 
    CalendarDays, 
    MapPin, 
    Clock, 
    Ticket as TicketIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBaseUrl, formatEventTime, giveLogo } from "@/lib/utils";

export default function ComboPackPage() {
    const params = useParams();
    const router = useRouter();
    const { id: eventId, comboGroupId } = params as { id: string; comboGroupId: string };

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ event: any; tickets: any[] } | null>(null);
    const [copied, setCopied] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [downloadingAll, setDownloadingAll] = useState(false);

    const ticketRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const { Image: QRImage } = useQRCode();

    useEffect(() => {
        const fetchComboPack = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/tickets/combo/${comboGroupId}`);
                setData(res.data);
            } catch (err: any) {
                console.error("Failed to fetch combo pack:", err);
                toast.error(err.response?.data?.error || "Failed to load combo pack");
            } finally {
                setLoading(false);
            }
        };

        if (comboGroupId) {
            fetchComboPack();
        }
    }, [comboGroupId]);

    const handleCopyShareLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Combo pack link copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
    };

    const handleDownloadSingle = async (ticket: any) => {
        const ref = ticketRefs.current[ticket._id];
        if (!ref) return;

        setDownloadingId(ticket._id);
        try {
            const dataUrl = await toPng(ref, { cacheBust: true, pixelRatio: 2 });
            const link = document.createElement("a");
            link.download = `ticket-${ticket.ticketNumber || ticket._id.slice(-6)}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Ticket downloaded");
        } catch (err) {
            console.error("Download error:", err);
            toast.error("Failed to download ticket image");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDownloadAll = async () => {
        if (!data?.tickets || data.tickets.length === 0) return;
        setDownloadingAll(true);
        try {
            for (let i = 0; i < data.tickets.length; i++) {
                const t = data.tickets[i];
                const ref = ticketRefs.current[t._id];
                if (ref) {
                    const dataUrl = await toPng(ref, { cacheBust: true, pixelRatio: 2 });
                    const link = document.createElement("a");
                    link.download = `ticket-${i + 1}-of-${data.tickets.length}-${t.ticketNumber || t._id.slice(-6)}.png`;
                    link.href = dataUrl;
                    link.click();
                    // Slight delay to prevent browser download throttling
                    await new Promise(r => setTimeout(r, 400));
                }
            }
            toast.success("All combo tickets downloaded successfully!");
        } catch (err) {
            console.error("Download all error:", err);
            toast.error("Failed downloading some tickets");
        } finally {
            setDownloadingAll(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Loading Combo Pack...</p>
            </div>
        );
    }

    if (!data || !data.tickets || data.tickets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
                <AlertCircle className="w-12 h-12 text-muted-foreground" />
                <h2 className="text-xl font-black text-foreground">Combo Pack Not Found</h2>
                <p className="text-sm text-muted-foreground max-w-md">
                    This combo pack could not be located or you don't have permission to access it.
                </p>
                <Link href={`/u/tickets/${eventId}`}>
                    <Button variant="outline" className="border-border rounded-sm">
                        <MoveLeft size={14} className="mr-2" /> Back to My Tickets
                    </Button>
                </Link>
            </div>
        );
    }

    const { event, tickets } = data;
    const eventTitle = event?.homeTeam 
        ? `${event.homeTeam?.name || event.homeTeam} vs ${event.awayTeam?.name || event.awayTeam}`
        : (event?.title || "Event");
    const packTypeName = tickets[0]?.stand || tickets[0]?.ticketType?.name || "Combo Pass";

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <Link 
                    href={`/u/tickets/${eventId}`}
                    className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                    <MoveLeft size={16} /> Back to Event Tickets
                </Link>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleCopyShareLink}
                        variant="outline"
                        size="sm"
                        className="rounded-sm border-border bg-card text-foreground hover:bg-muted text-xs font-bold gap-1.5"
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        {copied ? "Link Copied" : "Share Pack"}
                    </Button>

                    <Button
                        onClick={handleDownloadAll}
                        disabled={downloadingAll}
                        size="sm"
                        className="rounded-sm bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider gap-1.5"
                    >
                        {downloadingAll ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        {downloadingAll ? "Downloading..." : `Download All (${tickets.length})`}
                    </Button>
                </div>
            </div>

            {/* Event & Pack Header Banner */}
            <div className="bg-card border border-border rounded-sm p-6 mb-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-orange-500 text-white rounded-sm">
                                Combo Pack
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                                ID: {comboGroupId.slice(0, 8)}...
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                            {eventTitle}
                        </h1>
                        <p className="text-sm font-bold text-orange-500 uppercase tracking-wide">
                            {packTypeName} &bull; {tickets.length} Individual Tickets
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-xs text-muted-foreground border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 shrink-0">
                        {event?.date && (
                            <div className="flex items-center gap-2">
                                <CalendarDays size={16} className="text-orange-500 shrink-0" />
                                <div>
                                    <p className="font-bold text-foreground">{new Date(event.date).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>
                                    <p className="text-[10px]">{formatEventTime(event.date)}</p>
                                </div>
                            </div>
                        )}
                        {event?.venue && (
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-orange-500 shrink-0" />
                                <div>
                                    <p className="font-bold text-foreground max-w-[180px] truncate">{event.venue}</p>
                                    <p className="text-[10px]">Official Venue</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid of Tickets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket: any, index: number) => {
                    const isInside = ticket.isInside;
                    const statusText = isInside ? "Checked In" : "Ready to Scan";
                    const statusBg = isInside ? "bg-orange-500 text-white" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";

                    return (
                        <div 
                            key={ticket._id}
                            className="bg-card border border-border rounded-sm overflow-hidden shadow-sm flex flex-col justify-between"
                        >
                            {/* Hidden capture area & visual card */}
                            <div 
                                ref={(el) => { ticketRefs.current[ticket._id] = el; }}
                                className="p-5 bg-card flex flex-col items-center"
                            >
                                {/* Card Header */}
                                <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-border/80">
                                    <div className="flex items-center gap-2">
                                        <TicketIcon size={14} className="text-orange-500" />
                                        <span className="text-[11px] font-black uppercase tracking-wider text-foreground">
                                            Ticket #{index + 1} of {tickets.length}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase ${statusBg}`}>
                                        {statusText}
                                    </span>
                                </div>

                                {/* QR Code Container */}
                                <div className="bg-white p-4 rounded-md mb-4 shadow-inner">
                                    <QRImage
                                        text={`${getBaseUrl()}/tickets/p/${ticket.checkInToken}`}
                                        options={{
                                            type: "image/jpeg",
                                            quality: 0.3,
                                            errorCorrectionLevel: "M",
                                            margin: 2,
                                            scale: 4,
                                            width: 180,
                                            color: {
                                                dark: "#f97316",
                                                light: "#FFF",
                                            },
                                        }}
                                    />
                                </div>

                                {/* Ticket Metadata */}
                                <div className="w-full text-center space-y-1 mb-2">
                                    <p className="text-xs font-mono font-bold text-foreground tracking-wider">
                                        {ticket.ticketNumber || `#${ticket._id.slice(-8)}`}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground uppercase font-semibold">
                                        {ticket.stand || ticket.ticketType?.name || "Pass"} &bull; ₦{(ticket.price || 0).toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Holder: {ticket.holderName || "Guest"}
                                    </p>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="p-3 bg-muted/20 border-t border-border flex items-center gap-2">
                                <Button
                                    onClick={() => handleDownloadSingle(ticket)}
                                    disabled={downloadingId === ticket._id}
                                    variant="outline"
                                    size="sm"
                                    className="w-full rounded-sm border-border bg-card text-foreground hover:bg-muted text-xs font-bold gap-1.5"
                                >
                                    {downloadingId === ticket._id ? (
                                        <Loader2 size={13} className="animate-spin" />
                                    ) : (
                                        <Download size={13} />
                                    )}
                                    {downloadingId === ticket._id ? "Saving..." : "Download Pass"}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
