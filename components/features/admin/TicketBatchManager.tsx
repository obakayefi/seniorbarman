"use client"
import React, { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Loader2, Archive, History } from "lucide-react"
import api from "@/lib/axios"
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { toJpeg } from 'html-to-image'
import TicketPrintLayout from './TicketPrintLayout'

interface TicketBatchManagerProps {
    eventId: string
}

export default function TicketBatchManager({ eventId }: TicketBatchManagerProps) {
    const [batches, setBatches] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [processingBatch, setProcessingBatch] = useState<string | null>(null)

    // Hidden refs for printing
    const printRef = useRef<HTMLDivElement>(null)
    const [printData, setPrintData] = useState<{ tickets: any[], type: string } | null>(null)

    const fetchBatches = async () => {
        try {
            const res = await api.get(`/events/${eventId}/batches`)
            if (res.data.success) {
                setBatches(res.data.batches)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load batches")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBatches()
    }, [eventId])

    const handlePrintBatch = async (batchId: string, eventType: string = 'event') => {
        setProcessingBatch(batchId)
        const toastId = toast.loading("Fetching batch data...")
        try {
            const res = await api.get(`/tickets/batch/${batchId}`)
            const tickets = res.data.tickets

            if (!tickets || tickets.length === 0) {
                toast.error("No tickets found in batch", { id: toastId })
                setProcessingBatch(null)
                return
            }

            toast.loading(`Processing ${tickets.length} tickets into pages...`, { id: toastId })

            // Premium fits 8, Standard fits 20
            const ticketsPerPage = eventType === 'standard' ? 20 : 8;
            const chunks = []
            for (let i = 0; i < tickets.length; i += ticketsPerPage) {
                chunks.push(tickets.slice(i, i + ticketsPerPage))
            }

            const zip = new JSZip()
            const folder = zip.folder(`batch-${batchId.slice(0, 8)}`)

            for (let i = 0; i < chunks.length; i++) {
                toast.loading(`Generating Page ${i + 1} of ${chunks.length}...`, { id: toastId })
                setPrintData({ tickets: chunks[i], type: eventType })

                // Wait for render and image processing
                await new Promise(resolve => setTimeout(resolve, 500))

                if (printRef.current) {
                    // Optimized for speed, file size, and printers, but keeping pixelRatio high for QR sharpness
                    const dataUrl = await toJpeg(printRef.current, {
                        quality: 0.85, 
                        backgroundColor: 'white',
                        pixelRatio: 2 
                    })
                    const base64Data = dataUrl.split(',')[1]
                    folder?.file(`Page_${i + 1}.jpg`, base64Data, { base64: true })
                }
            }

            toast.loading("Compressing and starting download...", { id: toastId })
            const content = await zip.generateAsync({ type: "blob" })
            saveAs(content, `tickets-batch-${batchId.slice(0, 8)}.zip`)
            toast.success("Download started!", { id: toastId })

        } catch (error) {
            console.error(error)
            toast.error("Failed to process batch print", { id: toastId })
        } finally {
            setProcessingBatch(null)
            setPrintData(null)
        }
    }

    return (
        <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 shadow-lg mt-12">
            <CardHeader className="border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                    <History className="text-orange-500" />
                    <div>
                        <CardTitle className="text-white">Batch History</CardTitle>
                        <CardDescription className="text-zinc-400">Manage and print previously generated ticket batches</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex justify-center p-12 text-zinc-500"><Loader2 className="animate-spin mr-2" /> Loading batches...</div>
                ) : (
                    <Table>
                        <TableHeader className="bg-zinc-900/50">
                            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                                <TableHead className="text-zinc-400 font-medium w-[120px]">Batch ID</TableHead>
                                <TableHead className="text-zinc-400 font-medium">Date Created</TableHead>
                                <TableHead className="text-zinc-400 font-medium">Holder</TableHead>
                                <TableHead className="text-zinc-400 font-medium">Quantity</TableHead>
                                <TableHead className="text-zinc-400 font-medium">Type</TableHead>
                                <TableHead className="text-zinc-400 font-medium text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {batches.map((batch) => (
                                <TableRow key={batch._id} className="border-zinc-800 hover:bg-zinc-900/30 transition-colors">
                                    <TableCell className="font-mono text-xs text-zinc-500">{batch._id.slice(0, 8)}...</TableCell>
                                    <TableCell className="text-zinc-300">
                                        {new Date(batch.createdAt).toLocaleDateString()}
                                        <span className="text-xs text-zinc-500 ml-2">
                                            {new Date(batch.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium text-white">{batch.holderName || "Guest"}</TableCell>
                                    <TableCell>
                                        <span className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-xs font-semibold">
                                            {batch.count}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-zinc-400 text-sm capitalize">{batch.stand || "Regular"}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!!processingBatch}
                                            onClick={() => handlePrintBatch(batch._id)}
                                            className="border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all hover:border-zinc-600"
                                        >
                                            {processingBatch === batch._id ? (
                                                <><Loader2 className="h-3 w-3 animate-spin mr-2" /> Processing...</>
                                            ) : (
                                                <><Archive className="mr-2 h-3 w-3" /> Download ZIP</>
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {batches.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-zinc-600">
                                        <div className="flex flex-col items-center gap-2">
                                            <Archive className="opacity-20 w-10 h-10" />
                                            <p>No batches generated yet.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            {/* Hidden Print Layout Staging Area */}
            <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none">
                {printData && (
                    <TicketPrintLayout
                        ref={printRef}
                        tickets={printData.tickets}
                        type={printData.type}
                        eventId={eventId}
                    />
                )}
            </div>
        </Card>
    )
}
