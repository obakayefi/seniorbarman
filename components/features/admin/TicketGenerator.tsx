"use client"
import React, { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Download, Printer, Ticket } from "lucide-react"
import api from "@/lib/axios"
import TicketPrintLayout from './TicketPrintLayout'
import { toJpeg } from 'html-to-image'

interface TicketGeneratorProps {
    eventId: string
}

export default function TicketGenerator({ eventId }: TicketGeneratorProps) {
    const [loading, setLoading] = useState(false)
    const [eventLoading, setEventLoading] = useState(true)
    const [event, setEvent] = useState<any>(null)
    const [tickets, setTickets] = useState<any[]>([])
    const [config, setConfig] = useState({
        quantity: 14,
        type: 'sports',
        price: '5000',
        stand: 'Regular',
        holderName: 'Guest'
    })
    const printRef = useRef<HTMLDivElement>(null)

    // Fetch event details for preview rendering
    const fetchEvent = useCallback(async () => {
        try {
            setEventLoading(true)
            const res = await api.get(`/admin/events/${eventId}`)
            if (res.data.success) {
                setEvent(res.data.event)
            }
        } catch (error) {
            console.error("Failed to fetch event for preview:", error)
        } finally {
            setEventLoading(false)
        }
    }, [eventId])

    React.useEffect(() => {
        fetchEvent()
    }, [fetchEvent])

    // Construct mock tickets for the "Live Preview"
    const mockTickets = React.useMemo(() => {
        const perPage = config.type === 'standard' ? 20 : 8;

        if (tickets.length > 0) return tickets.slice(0, perPage);

        // Generate a full A4 page of mock tickets for preview
        return Array.from({ length: perPage }).map((_, i) => ({
            _id: `mock-${i}`,
            ticketNumber: `PREVIEW-${(i + 1).toString().padStart(6, '0')}`,
            checkInToken: `preview-token-${i}`,
            stand: config.stand,
            price: config.price,
            holderName: config.holderName || "Guest",
            event: event // Use the real event data fetched
        }));
    }, [tickets, config, event]);

    const handleGenerate = async () => {
        // ... (existing validation)
        if (!config.quantity || parseInt(config.quantity.toString()) <= 0) {
            toast.error("Please enter a valid quantity")
            return
        }
        if (!config.price || parseInt(config.price.toString()) < 0) {
            toast.error("Please enter a valid price")
            return
        }

        setLoading(true)
        try {
            const res = await api.post('/tickets/generate', {
                eventId,
                ...config
            })

            if (res.data.success) {
                setTickets(res.data.tickets)
                toast.success(`Generated ${res.data.tickets.length} tickets`)
            }
        } catch (error: any) {
            // ... error handling
            console.error("Generate error:", error)
            const errorMsg = error.response?.data?.error || "Failed to generate tickets"
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadImage = useCallback(async () => {
        if (printRef.current === null) return

        try {
            const dataUrl = await toJpeg(printRef.current, { quality: 0.85, backgroundColor: 'white', pixelRatio: 2 })
            const link = document.createElement('a')
            link.download = `tickets-${eventId}-${Date.now()}.jpeg`
            link.href = dataUrl
            link.click()
            toast.success("Image downloaded successfully")
        } catch (err) {
            console.error(err)
            toast.error("Failed to generate image")
        }
    }, [printRef, eventId])

    if (eventLoading) {
        return (
            <Card className="bg-zinc-950 border-zinc-800 p-12 flex justify-center items-center">
                <Loader2 className="animate-spin text-orange-500 h-8 w-8" />
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-zinc-100">
            {/* Configuration Panel */}
            <Card className="bg-zinc-950 border-zinc-800 h-fit lg:col-span-1 shadow-lg">
                <CardHeader className="border-b border-zinc-800 pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                        <Ticket className="text-orange-500" />
                        Configure Batch
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Customize appearance and generate tickets.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Layout Style</Label>
                        <Select
                            value={config.type}
                            onValueChange={(v) => setConfig({ ...config, type: v })}
                        >
                            <SelectTrigger className="bg-zinc-900 border-zinc-700 focus:ring-orange-500/20 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                <SelectItem value="sports">Premium Sports (8/Page)</SelectItem>
                                <SelectItem value="standard">Standard Grid (20/Page)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Quantity to Generate</Label>
                        <Input
                            type="number"
                            min={1}
                            value={config.quantity}
                            onChange={(e) => setConfig({ ...config, quantity: parseInt(e.target.value) || 0 })}
                            className="bg-zinc-900 border-zinc-700 focus:border-orange-500 focus:ring-orange-500/20 text-white placeholder:text-zinc-600"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Price (₦)</Label>
                            <Input
                                type="number"
                                min={0}
                                value={config.price}
                                onChange={(e) => setConfig({ ...config, price: e.target.value })}
                                className="bg-zinc-900 border-zinc-700 focus:border-orange-500 focus:ring-orange-500/20 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Ticket Class</Label>
                            <Select
                                value={config.stand}
                                onValueChange={(v) => setConfig({ ...config, stand: v })}
                            >
                                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                    <SelectItem value="Regular">Regular</SelectItem>
                                    <SelectItem value="VIP">VIP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Holder Name</Label>
                        <Input
                            type="text"
                            placeholder="e.g. Guest"
                            value={config.holderName}
                            onChange={(e) => setConfig({ ...config, holderName: e.target.value })}
                            className="bg-zinc-900 border-zinc-700 focus:border-orange-500 focus:ring-orange-500/20 text-white"
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-black h-14 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs"
                        >
                            {loading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizing...</>
                            ) : (
                                "Generate & Commit"
                            )}
                        </Button>
                        <p className="text-[10px] text-center text-zinc-500 mt-3 uppercase tracking-widest">
                            Review the preview before generating
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Preview Panel */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                            {tickets.length > 0 ? "Production Preview" : "Live Blueprint"}
                            {tickets.length === 0 && <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]">DRAFT</Badge>}
                        </h2>
                        <p className="text-xs text-zinc-400">Showing how your tickets will appear on A4 paper</p>
                    </div>
                    {tickets.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={handleDownloadImage}
                            className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors h-10 px-6 rounded-lg font-bold"
                        >
                            <Download className="mr-2 h-4 w-4" /> Save Page 1
                        </Button>
                    )}
                </div>

                <div className="bg-zinc-950 rounded-2xl p-8 overflow-auto border-2 border-dashed border-zinc-800 min-h-[700px] flex justify-center items-start shadow-inner bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px]">
                    <div className="scale-[0.55] origin-top border-8 border-white shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-white text-black w-fit transition-all duration-500 ease-in-out">
                        <TicketPrintLayout
                            ref={printRef}
                            tickets={mockTickets}
                            type={config.type}
                            eventId={eventId}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
