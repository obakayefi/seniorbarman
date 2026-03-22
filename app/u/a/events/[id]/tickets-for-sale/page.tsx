"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Download, Ticket, ArrowLeft, CheckCircle } from "lucide-react"
import api from "@/lib/axios"
import Link from 'next/link'
import JSZip from 'jszip'
import { toPng } from 'html-to-image'
import { saveAs } from 'file-saver'
import TicketZipRenderer from '@/components/features/admin/TicketZipRenderer'
import QRCode from 'qrcode'

export default function TicketsForSalePage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [event, setEvent] = useState<any>(null)
    const [allTickets, setAllTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [isGenerating, setIsGenerating] = useState(false)
    const [zipProgress, setZipProgress] = useState(0)
    const [zipStatus, setZipStatus] = useState("")
    const [downloadMode, setDownloadMode] = useState<'individual' | 'a4'>('individual')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get(`/admin/events/${id}`)
                if (res.data.success) {
                    setEvent(res.data.event)
                    // Filter for tickets generated specifically for sale/wizard
                    const gateTickets = res.data.tickets.filter((t: any) => 
                        t.generatedBy === 'gate-sale' || 
                        t.generatedBy === 'wizard' ||
                        (!t.generatedBy && t.price === 0)
                    )
                    setAllTickets(gateTickets)
                }
            } catch (error) {
                toast.error("Failed to load ticket data")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchData()
    }, [id])

    // HIGH SPEED OVERLAY LOGIC (Sync with Wizard)
    const drawTicketOverlays = async (ctx: CanvasRenderingContext2D, ticket: any, canvasWidth: number) => {
        const scale = canvasWidth / 100 // pixels per mm

        // 1. Generate and Draw QR Code
        const qrDataUrl = await QRCode.toDataURL(`${window.location.origin}/tickets/p/${ticket.checkInToken}`, {
            margin: 0,
            width: 300,
            color: { dark: '#000000', light: '#ffffff00' },
            errorCorrectionLevel: 'H'
        })
        const qrImg = new Image()
        await new Promise(r => { qrImg.onload = r; qrImg.src = qrDataUrl })
        ctx.drawImage(qrImg, canvasWidth - (32 * scale), (26 * scale), 24 * scale, 24 * scale)

        // 2. Draw Ticket Number
        ctx.fillStyle = "#A1A1AA"
        ctx.font = `bold ${2.2 * scale}px monospace`
        ctx.textAlign = "center"
        ctx.fillText(`#${ticket.ticketNumber.slice(-8).toUpperCase()}`, canvasWidth - (20 * scale), (53.5 * scale))

        // 3. Draw SCAN GATE text
        ctx.fillStyle = "#A1A1AA"
        ctx.font = `900 ${2.2 * scale}px sans-serif`
        ctx.textAlign = "center"
        ctx.fillText("SCAN GATE", canvasWidth - (20 * scale), (50.5 * scale))

        // 4. Draw Holder Info (Side by side)
        ctx.textAlign = "left"
        ctx.fillStyle = "#A1A1AA"
        ctx.font = `bold ${2.2 * scale}px sans-serif`
        ctx.fillText("HOLDER:", (14 * scale), (53.5 * scale))
        
        const labelWidth = ctx.measureText("HOLDER: ").width
        ctx.fillStyle = "#18181B"
        ctx.font = `900 ${3 * scale}px sans-serif`
        ctx.fillText(ticket.holderName || "Guest", (14 * scale) + labelWidth + (1 * scale), (53.5 * scale))

        // 5. No Price for gate tickets
    }

    const generateZipFiles = async () => {
        if (!allTickets.length) return
        setZipStatus("Initializing fast generator...")
        setZipProgress(0)
        setIsGenerating(true)

        try {
            const zip = new JSZip()
            const uniqueStands = Array.from(new Set(allTickets.map(t => t.stand || "Regular")))
            const templates: Record<string, HTMLImageElement> = {}
            
            setZipStatus("Capturing design templates...")
            for (const stand of uniqueStands) {
                const node = document.getElementById(`template-node-${stand}`)
                if (node) {
                    const dataUrl = await toPng(node, { pixelRatio: 3, skipFonts: false })
                    const img = new Image()
                    await new Promise((resolve) => {
                        img.onload = resolve
                        img.src = dataUrl
                    })
                    templates[stand] = img
                }
            }

            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error("Could not get canvas context")
            const firstTemplate = Object.values(templates)[0]
            if (!firstTemplate) throw new Error("No templates generated")
            canvas.width = firstTemplate.width
            canvas.height = firstTemplate.height

            setZipStatus("Generating images at high speed...")
            
            if (downloadMode === 'individual') {
                const folder = zip.folder(`Individual_Tickets`)
                for (let i = 0; i < allTickets.length; i++) {
                    const ticket = allTickets[i]
                    const stand = ticket.stand || "Regular"
                    const template = templates[stand]
                    if (template) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height)
                        ctx.drawImage(template, 0, 0)
                        await drawTicketOverlays(ctx, ticket, canvas.width)
                        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 0.95))
                        if (blob) folder?.file(`${stand}_${ticket.ticketNumber}.png`, blob)
                    }
                    if (i % 10 === 0) setZipProgress(Math.floor(((i + 1) / allTickets.length) * 100))
                }
            } else {
                const folder = zip.folder(`A4_Sheets`)
                const a4Canvas = document.createElement('canvas')
                const a4Ctx = a4Canvas.getContext('2d')
                if (!a4Ctx) throw new Error("Could not get A4 canvas context")
                a4Canvas.width = 2480
                a4Canvas.height = 3508
                const ticketWidthPx = 1181 
                const ticketHeightPx = 768
                const marginX = (a4Canvas.width - (ticketWidthPx * 2)) / 2
                const marginY = (a4Canvas.height - (ticketHeightPx * 4)) / 2

                for (let i = 0; i < allTickets.length; i += 8) {
                    const pageNum = Math.floor(i / 8) + 1
                    a4Ctx.fillStyle = 'white'
                    a4Ctx.fillRect(0, 0, a4Canvas.width, a4Canvas.height)
                    for (let j = 0; j < 8; j++) {
                        const ticketIdx = i + j
                        if (ticketIdx >= allTickets.length) break
                        const ticket = allTickets[ticketIdx]
                        const stand = ticket.stand || "Regular"
                        const template = templates[stand]
                        if (template) {
                            const col = j % 2
                            const row = Math.floor(j / 2)
                            const x = marginX + (col * ticketWidthPx)
                            const y = marginY + (row * ticketHeightPx)
                            ctx.clearRect(0, 0, canvas.width, canvas.height)
                            ctx.drawImage(template, 0, 0)
                            await drawTicketOverlays(ctx, ticket, canvas.width)
                            a4Ctx.drawImage(canvas, x, y, ticketWidthPx, ticketHeightPx)
                            a4Ctx.strokeStyle = '#E4E4E7'
                            a4Ctx.lineWidth = 1
                            a4Ctx.strokeRect(x, y, ticketWidthPx, ticketHeightPx)
                        }
                    }
                    const blob = await new Promise<Blob | null>(resolve => a4Canvas.toBlob(resolve, 'image/png', 0.90))
                    if (blob) folder?.file(`Page_${pageNum}.png`, blob)
                    setZipProgress(Math.floor(((i + 8) / allTickets.length) * 100))
                }
            }

            setZipStatus("Packaging ZIP file...")
            const dateAbbr = event?.date ? new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).replace(' ', '-') : 'TBA'
            const eventName = (event?.title || `${event?.homeTeam}_vs_${event?.awayTeam}`).replace(/\s+/g, '_')
            const zipFileName = `Tickets_Sale_${eventName}_${dateAbbr}.zip`
            const content = await zip.generateAsync({ type: 'blob' })
            saveAs(content, zipFileName)
            setZipStatus("Done!")
            toast.success("Zip file downloaded successfully!")
        } catch (error) {
            console.error("ZIP Generation Error", error)
            toast.error("Failed to generate ZIP file")
        } finally {
            setIsGenerating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-zinc-950">
                <Loader2 className="animate-spin text-orange-500 h-8 w-8" />
            </div>
        )
    }

    // Group tickets by stand for summary
    const standSummary = allTickets.reduce((acc: any, t) => {
        acc[t.stand || "Regular"] = (acc[t.stand || "Regular"] || 0) + 1
        return acc
    }, {})

    return (
        <div className="md:p-10 p-6 w-full space-y-8 min-h-screen bg-zinc-950 text-white pb-20">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col space-y-4">
                    <Link href={`/u/a/events/${id}`} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm w-fit group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Event
                    </Link>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                            Tickets For Sale
                        </h1>
                        <p className="text-zinc-400 mt-2">
                            Manage and reprint bulk tickets for <strong className="text-white">{event?.title || event?.homeTeam}</strong>.
                        </p>
                    </div>
                </div>

                {!allTickets.length ? (
                    <Card className="bg-zinc-900 border-zinc-800 shadow-xl text-white">
                        <CardContent className="pt-20 pb-20 flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center">
                                <Ticket className="w-10 h-10 text-zinc-600" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-white">No Tickets Found</h2>
                                <p className="text-zinc-500 max-w-sm mx-auto">
                                    We couldn't find any tickets generated via the wizard for this event. 
                                    Try generating some first!
                                </p>
                            </div>
                            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-black font-bold">
                                <Link href={`/u/a/events/${id}/generate-wizard`}>
                                    Go to Generation Wizard
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2 bg-zinc-900 border-zinc-800 shadow-xl text-white">
                            <CardHeader className="border-b border-zinc-800">
                                <CardTitle className="text-xl font-black flex items-center gap-2">
                                    <Ticket className="text-orange-500" /> Export Summary
                                </CardTitle>
                                <CardDescription className="text-zinc-400">Total tickets available for bulk printing.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-lg font-bold text-white">Batches Found</Label>
                                    <div className="space-y-3">
                                        {Object.entries(standSummary).map(([stand, count]: [any, any]) => (
                                            <div key={stand} className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/80">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-zinc-500 uppercase font-black tracking-widest">Stand / Type</span>
                                                    <span className="text-lg font-bold text-white">{stand}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs text-zinc-500 uppercase font-black tracking-widest">Quantity</span>
                                                    <span className="text-xl font-black text-orange-500">{count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-zinc-800">
                                    <Label className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Download Format</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => setDownloadMode('individual')}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${downloadMode === 'individual' ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700'}`}
                                        >
                                            <Ticket className="w-6 h-6" />
                                            <span className="font-bold">Individual PNGs</span>
                                        </button>
                                        <button 
                                            onClick={() => setDownloadMode('a4')}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${downloadMode === 'a4' ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700'}`}
                                        >
                                            <div className="w-6 h-7 border-2 border-current rounded-sm flex flex-col gap-0.5 p-0.5">
                                                <div className="w-full h-0.5 bg-current opacity-30" />
                                                <div className="w-full h-0.5 bg-current opacity-30" />
                                            </div>
                                            <span className="font-bold">A4 Sheets</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-zinc-800 space-y-4">
                                    <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-lg">
                                        <span className="text-zinc-400 font-medium">Total Tickets:</span>
                                        <span className="text-2xl font-black text-white">{allTickets.length}</span>
                                    </div>
                                    <Button 
                                        onClick={generateZipFiles}
                                        disabled={isGenerating}
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-black font-black h-14 text-lg"
                                    >
                                        {isGenerating ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {zipStatus}</>
                                        ) : (
                                            <><Download className="mr-2 h-5 w-5" /> Download All Tickets</>
                                        )}
                                    </Button>
                                </div>

                                {isGenerating && (
                                    <div className="space-y-2">
                                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${zipProgress}%` }} />
                                        </div>
                                        <p className="text-center text-xs text-zinc-500">{zipProgress}% Complete</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800 shadow-xl text-white h-fit">
                            <CardHeader>
                                <CardTitle className="text-lg font-black italic">Printing Guide</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-zinc-400 space-y-4">
                                <p>For the best results with <strong>A4 Sheets</strong>:</p>
                                <ul className="list-disc pl-4 space-y-2">
                                    <li>Set scaling to <b>100%</b> (No margin scaling) to preserve the exact ticket dimensions.</li>
                                    <li>Light crop marks are provided to guide manual cutting.</li>
                                    <li>Recommended paper: <b>250gsm - 300gsm Cardboard</b>.</li>
                                </ul>
                                <div className="pt-4 border-t border-zinc-800">
                                    <p className="text-xs italic">Tickets here include all batches generated via the wizard for this event.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    {/* Live Print Preview */}
                    <div className="mt-12 space-y-4">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                           Live A4 Preview
                        </h2>
                        <p className="text-sm text-zinc-400">See exactly how your tickets translate to physical paper (First 8 tickets).</p>
                        <div className="bg-zinc-950 rounded-2xl border-2 border-dashed border-zinc-800 flex justify-center shadow-inner overflow-hidden h-[600px] relative">
                            <div className="scale-[0.50] origin-top absolute top-6 bg-white w-[210mm] h-[297mm] shadow-[0_0_50px_rgba(0,0,0,0.5)] shrink-0">
                                <div className="absolute top-[18.5mm] left-[5mm] right-[5mm] grid grid-cols-2">
                                    {allTickets.slice(0, 8).map(ticket => (
                                        <div key={ticket._id} className="w-[100mm] h-[65mm] border-[0.5pt] border-zinc-200 overflow-hidden">
                                            <TicketZipRenderer ticket={ticket} templateMode={false} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            </div>

            {/* Hidden renderer for Template capture */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', pointerEvents: 'none' }}>
                {Object.keys(standSummary).map(stand => (
                    <div key={stand} id={`template-node-${stand}`}>
                        <TicketZipRenderer 
                            ticket={{ event, stand, holderName: "", ticketNumber: "", checkInToken: "", price: 0, generatedBy: 'gate-sale' }} 
                            templateMode={true} 
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
