"use client"
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
    Copy,
    Check,
    Share2,
    ExternalLink,
    MessageCircle,
    Twitter,
    Sparkles,
    Calendar,
    MapPin,
    QrCode
} from "lucide-react"
import { DownloadEventQR } from '@/components/features/download-event-qr'

interface ShareEventModalProps {
    isOpen: boolean
    onClose: () => void
    event: {
        _id: string
        title?: string
        homeTeam?: any
        awayTeam?: any
        type?: string
        date?: string | Date
        venue?: string
        isAudition?: boolean
        requiresApplication?: boolean
    }
}

export function ShareEventModal({ isOpen, onClose, event }: ShareEventModalProps) {
    const [copied, setCopied] = useState(false)

    if (!event) return null

    const eventTitle = event.type === 'sports'
        ? `${event.homeTeam?.name || event.homeTeam || 'Home'} vs ${event.awayTeam?.name || event.awayTeam || 'Away'}`
        : (event.title || 'Event')

    // Determine the shareable public landing page link
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const shareUrl = `${origin}/events/${event._id}`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            toast.success("Link copied to clipboard!")
            setTimeout(() => setCopied(false), 2500)
        } catch {
            toast.error("Failed to copy link")
        }
    }

    const handleWhatsAppShare = () => {
        const text = encodeURIComponent(
            `🔥 Check out ${eventTitle} on SeniorBarman!\n📍 Venue: ${event.venue || 'TBA'}\n👉 Secure your spot here: ${shareUrl}`
        )
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
    }

    const handleTwitterShare = () => {
        const text = encodeURIComponent(
            `Get your tickets for ${eventTitle} now on @SeniorBarman! ${shareUrl}`
        )
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg bg-card border border-border dark:border-zinc-800 rounded-lg p-6 shadow-2xl">
                <DialogHeader className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-sm bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                            <Share2 size={18} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight text-foreground">
                                Share Event Link
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Share this direct landing page link with fans and attendees.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 pt-3">
                    {/* Event Preview Banner */}
                    <div className="p-4 rounded-sm bg-muted/40 border border-border space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-xs bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                {event.isAudition ? "Audition Portal" : event.requiresApplication ? "Application Portal" : "Event Tickets"}
                            </span>
                        </div>
                        <h4 className="text-base font-black text-foreground line-clamp-1">
                            {eventTitle}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {event.venue && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} className="text-orange-500" />
                                    {event.venue}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Copy Link Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Direct Public URL
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                readOnly
                                value={shareUrl}
                                className="h-10 text-xs font-mono bg-muted/30 border-border text-foreground rounded-sm selection:bg-orange-500/30"
                            />
                            <Button
                                onClick={handleCopy}
                                className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-sm shrink-0 uppercase tracking-wider text-xs"
                            >
                                {copied ? <Check size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </div>
                    </div>

                    {/* Social Quick Share Buttons */}
                    <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Quick Share To Audience
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleWhatsAppShare}
                                className="h-10 rounded-sm border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs justify-center"
                            >
                                <MessageCircle size={15} className="mr-1.5 text-emerald-500" />
                                WhatsApp
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleTwitterShare}
                                className="h-10 rounded-sm border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs justify-center"
                            >
                                <Twitter size={15} className="mr-1.5 text-blue-500" />
                                X / Twitter
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="h-10 rounded-sm border-border bg-card hover:bg-muted text-foreground font-semibold text-xs justify-center"
                            >
                                <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink size={15} className="mr-1.5 text-orange-500" />
                                    Preview Page
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Branded Event QR Code */}
                    <div className="p-4 rounded-sm bg-orange-500/5 border border-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                            <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <QrCode size={14} className="text-orange-500" />
                                Branded Event QR Card
                            </h5>
                            <p className="text-[11px] text-muted-foreground">
                                High-res flyer card with poster, logo & direct event share link.
                            </p>
                        </div>
                        <DownloadEventQR event={event} className="shrink-0 w-full sm:w-auto" />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
