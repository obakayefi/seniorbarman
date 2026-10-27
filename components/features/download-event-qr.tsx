"use client"
import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { QrCode, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface DownloadEventQRProps {
    event: {
        _id: string
        title?: string
        homeTeam?: any
        awayTeam?: any
        type?: string
        date?: string | Date
        venue?: string
        image?: string
        createdBy?: any
        organizer?: string
        hostName?: string
    }
    variant?: "default" | "outline" | "secondary" | "ghost"
    className?: string
    buttonText?: string
}

export function DownloadEventQR({
    event,
    variant = "outline",
    className,
    buttonText = "Download QR"
}: DownloadEventQRProps) {
    const [generating, setGenerating] = useState(false)

    const eventTitle = event.type === 'sports'
        ? `${event.homeTeam?.name || event.homeTeam || 'Home'} vs ${event.awayTeam?.name || event.awayTeam || 'Away'}`
        : (event.title || 'Event')

    // Determine host/creator name
    const hostName = 
        (typeof event.createdBy === 'object' && event.createdBy !== null
            ? `${event.createdBy.firstName || ''} ${event.createdBy.lastName || ''}`.trim() || event.createdBy.name || event.createdBy.email
            : '') ||
        event.hostName ||
        event.organizer ||
        ''

    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const shareUrl = `${origin}/events/${event._id}`

    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => resolve(img)
            img.onerror = () => {
                const fallbackImg = new Image()
                fallbackImg.onload = () => resolve(fallbackImg)
                fallbackImg.onerror = reject
                fallbackImg.src = src
            }
            img.src = src
        })
    }

    const drawCard = async (): Promise<Blob | null> => {
        const QRCodeStyling = (await import('qr-code-styling')).default

        // ── Layout constants ──
        const CARD_WIDTH = 1080
        const CARD_PADDING = 64
        const QR_SIZE = 580
        const CORNER_RADIUS = 36

        // ── Load brand logo for header ──
        let logoImage: HTMLImageElement | null = null
        try {
            logoImage = await loadImage('/logo.png')
        } catch {
            console.warn('Could not load /logo.png')
        }

        // ── Generate QR code without logo in the middle ──
        const qrCode = new QRCodeStyling({
            width: QR_SIZE,
            height: QR_SIZE,
            data: shareUrl,
            dotsOptions: {
                color: '#0F172A',
                type: 'rounded',
            },
            backgroundOptions: {
                color: '#FFFFFF',
            },
            cornersSquareOptions: {
                color: '#EA580C', // Orange brand accent
                type: 'extra-rounded',
            },
            cornersDotOptions: {
                color: '#EA580C',
                type: 'dot',
            },
        })

        const rawQrData = await qrCode.getRawData('png')
        if (!rawQrData) throw new Error('Failed to generate QR code')

        const qrBlob = rawQrData instanceof Blob ? rawQrData : new Blob([rawQrData as any], { type: 'image/png' })
        const qrDataUrl = URL.createObjectURL(qrBlob)
        const qrImage = await loadImage(qrDataUrl)

        // ── Height calculation ──
        // Header + Spacing + QR Section + Title/Meta + Host badge + Footer
        const HEADER_HEIGHT = 120
        const QR_SECTION_HEIGHT = QR_SIZE + 48
        const TEXT_SECTION_HEIGHT = hostName ? 200 : 150
        const FOOTER_HEIGHT = 70
        const CARD_HEIGHT = CARD_PADDING + HEADER_HEIGHT + QR_SECTION_HEIGHT + TEXT_SECTION_HEIGHT + FOOTER_HEIGHT + CARD_PADDING

        // ── Create Canvas ──
        const canvas = document.createElement('canvas')
        canvas.width = CARD_WIDTH
        canvas.height = CARD_HEIGHT
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Could not get canvas context')

        // ── Card background: Premium crisp clean gradient ──
        const bgGrad = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT)
        bgGrad.addColorStop(0, '#FFFFFF')
        bgGrad.addColorStop(0.6, '#FBFBFB')
        bgGrad.addColorStop(1, '#F3F4F6')
        ctx.fillStyle = bgGrad
        roundRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, CORNER_RADIUS)
        ctx.fill()

        // ── Card outer border ──
        ctx.strokeStyle = '#E2E8F0'
        ctx.lineWidth = 2
        roundRect(ctx, 1, 1, CARD_WIDTH - 2, CARD_HEIGHT - 2, CORNER_RADIUS)
        ctx.stroke()

        // ── Top Brand Strip ──
        const stripGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0)
        stripGrad.addColorStop(0, '#EA580C')
        stripGrad.addColorStop(0.5, '#F97316')
        stripGrad.addColorStop(1, '#FB923C')
        ctx.fillStyle = stripGrad
        roundRectTop(ctx, 0, 0, CARD_WIDTH, 12, CORNER_RADIUS)
        ctx.fill()

        let yOffset = CARD_PADDING

        // ── Header: SeniorBarman Brand Logo (Strategic placement) ──
        if (logoImage) {
            const logoTargetHeight = 48
            const logoAspect = logoImage.width / logoImage.height
            const logoTargetWidth = logoTargetHeight * logoAspect
            const logoX = (CARD_WIDTH - logoTargetWidth) / 2
            ctx.drawImage(logoImage, logoX, yOffset + 6, logoTargetWidth, logoTargetHeight)
        } else {
            ctx.fillStyle = '#EA580C'
            ctx.font = '900 32px "Inter", "Segoe UI", system-ui, sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('SENIORBARMAN', CARD_WIDTH / 2, yOffset + 40)
        }

        // Subtitle / Tagline
        ctx.fillStyle = '#64748B'
        ctx.font = '700 14px "Inter", "Segoe UI", system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('SCAN TO VIEW EVENT & PURCHASE TICKETS', CARD_WIDTH / 2, yOffset + 82)

        // Subtle divider
        ctx.strokeStyle = '#E2E8F0'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(CARD_PADDING + 80, yOffset + 104)
        ctx.lineTo(CARD_WIDTH - CARD_PADDING - 80, yOffset + 104)
        ctx.stroke()

        yOffset += HEADER_HEIGHT + 16

        // ── QR Code Section (Centered & Framed) ──
        const qrX = (CARD_WIDTH - QR_SIZE) / 2
        const qrY = yOffset

        // Crisp White Card container around QR code with subtle shadow/border
        ctx.fillStyle = '#FFFFFF'
        roundRect(ctx, qrX - 24, qrY - 24, QR_SIZE + 48, QR_SIZE + 48, 28)
        ctx.fill()

        ctx.strokeStyle = '#E2E8F0'
        ctx.lineWidth = 2
        roundRect(ctx, qrX - 24, qrY - 24, QR_SIZE + 48, QR_SIZE + 48, 28)
        ctx.stroke()

        // Inner subtle brand glow accent border
        ctx.strokeStyle = 'rgba(234, 88, 12, 0.15)'
        ctx.lineWidth = 1
        roundRect(ctx, qrX - 12, qrY - 12, QR_SIZE + 24, QR_SIZE + 24, 20)
        ctx.stroke()

        // Draw QR code image
        ctx.drawImage(qrImage, qrX, qrY, QR_SIZE, QR_SIZE)

        URL.revokeObjectURL(qrDataUrl)

        yOffset = qrY + QR_SIZE + 52

        // ── Event Info Section ──
        ctx.textAlign = 'center'

        // Event Title
        ctx.fillStyle = '#0F172A'
        ctx.font = '900 34px "Inter", "Segoe UI", system-ui, sans-serif'
        const truncatedTitle = eventTitle.length > 36 ? eventTitle.slice(0, 33) + '...' : eventTitle
        ctx.fillText(truncatedTitle, CARD_WIDTH / 2, yOffset + 16)

        // Event Venue & Date
        const metaParts: string[] = []
        if (event.venue) metaParts.push(`📍 ${event.venue}`)
        if (event.date) {
            try {
                metaParts.push(`📅 ${format(new Date(event.date), 'EEE, MMM dd, yyyy')}`)
            } catch {
                metaParts.push(`📅 ${String(event.date)}`)
            }
        }

        if (metaParts.length > 0) {
            ctx.fillStyle = '#475569'
            ctx.font = '600 20px "Inter", "Segoe UI", system-ui, sans-serif'
            const metaString = metaParts.join('   •   ')
            const truncatedMeta = metaString.length > 55 ? metaString.slice(0, 52) + '...' : metaString
            ctx.fillText(truncatedMeta, CARD_WIDTH / 2, yOffset + 58)
        }

        // ── Hosted By section ──
        if (hostName) {
            const hostBadgeY = yOffset + 98
            const hostText = `HOSTED BY ${hostName.toUpperCase()}`

            ctx.font = '800 16px "Inter", "Segoe UI", system-ui, sans-serif'
            const textMetrics = ctx.measureText(hostText)
            const badgeW = Math.max(textMetrics.width + 48, 220)
            const badgeH = 38
            const badgeX = (CARD_WIDTH - badgeW) / 2

            // Hosted by pill pill background
            ctx.fillStyle = 'rgba(234, 88, 12, 0.08)'
            roundRect(ctx, badgeX, hostBadgeY, badgeW, badgeH, 19)
            ctx.fill()

            // Hosted by pill border
            ctx.strokeStyle = 'rgba(234, 88, 12, 0.3)'
            ctx.lineWidth = 1.5
            roundRect(ctx, badgeX, hostBadgeY, badgeW, badgeH, 19)
            ctx.stroke()

            // Hosted by text
            ctx.fillStyle = '#C2410C'
            ctx.fillText(hostText, CARD_WIDTH / 2, hostBadgeY + 24)

            yOffset += 46
        }

        yOffset += 110

        // ── Footer: Strategic Brand Attribution Only (URL removed) ──
        // Subtle divider
        ctx.strokeStyle = '#E2E8F0'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(CARD_PADDING + 140, yOffset - 18)
        ctx.lineTo(CARD_WIDTH - CARD_PADDING - 140, yOffset - 18)
        ctx.stroke()

        ctx.fillStyle = '#64748B'
        ctx.font = '800 13px "Inter", "Segoe UI", system-ui, sans-serif'
        ctx.letterSpacing = '1px'
        ctx.fillText('POWERED BY SENIORBARMAN • ALL RIGHTS RESERVED', CARD_WIDTH / 2, yOffset + 12)

        return new Promise<Blob | null>((resolve, reject) => {
            try {
                canvas.toBlob((blob) => resolve(blob), 'image/png')
            } catch (err) {
                reject(err)
            }
        })
    }

    const generateQR = useCallback(async () => {
        setGenerating(true)
        try {
            const blob = await drawCard()

            if (!blob) {
                toast.error('Failed to generate QR image')
                return
            }

            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            const safeName = eventTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)
            link.download = `SeniorBarman_QR_${safeName}.png`
            link.href = url
            link.click()
            URL.revokeObjectURL(url)
            toast.success('QR Code downloaded successfully!')
        } catch (error) {
            console.error('QR generation error:', error)
            toast.error('Failed to generate QR code')
        } finally {
            setGenerating(false)
        }
    }, [event, shareUrl, eventTitle, hostName])

    return (
        <Button
            onClick={generateQR}
            disabled={generating}
            variant={variant}
            className={`border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 font-bold rounded-sm shadow-sm h-10 uppercase tracking-wider text-xs flex items-center gap-1.5 transition-all ${className || ''}`}
        >
            {generating ? (
                <>
                    <Loader2 size={15} className="animate-spin text-orange-500" />
                    Generating QR...
                </>
            ) : (
                <>
                    <QrCode size={15} className="text-orange-500" />
                    {buttonText}
                </>
            )}
        </Button>
    )
}

// ── Canvas helper: Rounded rectangle path ──
function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
}

// ── Canvas helper: Rounded rectangle only at the top ──
function roundRectTop(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x, y + h)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
}
