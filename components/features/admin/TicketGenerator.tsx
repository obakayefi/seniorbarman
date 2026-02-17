"use client"
import React, { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    const [tickets, setTickets] = useState<any[]>([])
    const [config, setConfig] = useState({
        quantity: 14,
        type: 'sports',
        price: '5000',
        stand: 'Regular',
        holderName: 'Guest'
    })
    const printRef = useRef<HTMLDivElement>(null)

    const handleGenerate = async () => {
        // Validation
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
                // Refresh batch list logic should be triggered here, ideally via callback or context
                // For now, simple page reload or we can rely on user manually refreshing
                window.location.reload()
            }
        } catch (error: any) {
            console.error("Generate error:", error)
            const errorMsg = error.response?.data?.error || "Failed to generate tickets"
            const errorDetails = error.response?.data?.details

            if (errorDetails) {
                console.error("Missing fields:", errorDetails)
                toast.error(`${errorMsg}. Check console for details.`)
            } else {
                toast.error(errorMsg)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadImage = useCallback(async () => {
        if (printRef.current === null) return

        try {
            const dataUrl = await toJpeg(printRef.current, { quality: 0.95, backgroundColor: 'white' })
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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-zinc-100">
            {/* Configuration Panel */}
            <Card className="bg-zinc-950 border-zinc-800 h-fit lg:col-span-1 shadow-lg">
                <CardHeader className="border-b border-zinc-800 pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                        <Ticket className="text-orange-500" />
                        Ticket Configuration
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Configure and generate a new batch of tickets.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Layout Type</Label>
                        <Select
                            value={config.type}
                            onValueChange={(v) => setConfig({ ...config, type: v })}
                        >
                            <SelectTrigger className="bg-zinc-900 border-zinc-700 focus:ring-orange-500/20 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                <SelectItem value="sports">Sports Layout (14/Page)</SelectItem>
                                <SelectItem value="standard">Standard Grid (QR Code)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-300">Quantity</Label>
                        <Input
                            type="number"
                            min={1}
                            value={config.quantity}
                            onChange={(e) => setConfig({ ...config, quantity: parseInt(e.target.value) || 0 })}
                            className="bg-zinc-900 border-zinc-700 focus:border-orange-500 focus:ring-orange-500/20 text-white placeholder:text-zinc-600"
                        />
                        <p className="text-xs text-zinc-500">
                            {config.type === 'sports' ? 'Optimized for A4 (14 tickets per page)' : 'Generates items in a grid'}
                        </p>
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
                                    <SelectItem value="VVIP">VVIP</SelectItem>
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
                        <p className="text-xs text-zinc-500">
                            Printed on ticket. Defaults to 'Guest' if empty.
                        </p>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-6 shadow-md shadow-orange-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
                            </>
                        ) : (
                            "Generate Batch"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Preview Panel */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
                    <div>
                        <h2 className="text-xl font-bold text-white">Live Preview</h2>
                        <p className="text-sm text-zinc-400">Preview generated tickets before downloading</p>
                    </div>
                    {tickets.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={handleDownloadImage}
                            className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                        >
                            <Download className="mr-2 h-4 w-4" /> Download Image
                        </Button>
                    )}
                </div>

                <div className="bg-zinc-950 rounded-xl p-8 overflow-auto border-2 border-dashed border-zinc-800 min-h-[600px] flex justify-center items-start shadow-inner">
                    {tickets.length > 0 ? (
                        <div className="scale-[0.65] origin-top border shadow-2xl bg-white text-black w-fit transition-transform">
                            <TicketPrintLayout
                                ref={printRef}
                                tickets={tickets}
                                type={config.type}
                                eventId={eventId}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-4 mt-32">
                            <div className="p-6 bg-zinc-900 rounded-full border border-zinc-800">
                                <Printer size={48} className="opacity-50" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-medium text-zinc-400">No Tickets Generated</p>
                                <p className="text-sm">Configure and generate tickets to see a preview here.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
