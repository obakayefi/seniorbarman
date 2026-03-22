"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Plus, X, CheckCircle, Download } from "lucide-react"
import api from "@/lib/axios"
import Link from 'next/link'

export default function TicketWizardPage() {
    const params = useParams()
    const id = params.id as string

    const [event, setEvent] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [batches, setBatches] = useState([
        { stand: 'Popular', quantity: 0 },
        { stand: 'Regular', quantity: 0 },
        { stand: 'Executive', quantity: 0 },
    ])

    const [isGenerating, setIsGenerating] = useState(false)
    const [isGenerated, setIsGenerated] = useState(false)
    const [genProgress, setGenProgress] = useState(0)
    const [existingCount, setExistingCount] = useState(0)
    const [existingSummary, setExistingSummary] = useState<Record<string, number>>({})

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await api.get(`/admin/events/${id}`)
                if (res.data.success) {
                    setEvent(res.data.event)
                    const gateTickets = res.data.tickets.filter((t: any) =>
                        t.generatedBy === 'gate-sale' || t.generatedBy === 'wizard' || (!t.generatedBy && t.price === 0)
                    )
                    setExistingCount(gateTickets.length)
                    
                    const summary = gateTickets.reduce((acc: any, t: any) => {
                        acc[t.stand || "Regular"] = (acc[t.stand || "Regular"] || 0) + 1
                        return acc
                    }, {})
                    setExistingSummary(summary)
                }
            } catch (error) {
                toast.error("Failed to load event data")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchEvent()
    }, [id])

    const addBatch = () => {
        setBatches([...batches, { stand: '', quantity: 0 }])
    }

    const removeBatch = (index: number) => {
        setBatches(batches.filter((_, i) => i !== index))
    }

    const updateBatch = (index: number, field: string, value: any) => {
        const newBatches = [...batches]
        newBatches[index] = { ...newBatches[index], [field]: value }
        setBatches(newBatches)
    }

    const totalTickets = batches.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0)

    const handleSubmit = async () => {
        if (totalTickets === 0) {
            toast.error("Please add at least one ticket")
            return
        }

        if (totalTickets > 400) {
            toast.error("Maximum 400 tickets allowed at once")
            return
        }

        setIsGenerating(true)
        setGenProgress(0)

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
            setGenProgress(prev => {
                if (prev >= 90) return prev
                return prev + 10
            })
        }, 200)

        try {
            await api.post('/tickets/wizard', {
                eventId: id,
                batches
            })

            clearInterval(progressInterval)
            setGenProgress(100)

            setTimeout(() => {
                setIsGenerated(true)
                setIsGenerating(false)
                toast.success("Tickets generated successfully!")
            }, 500)
        } catch (error: any) {
            clearInterval(progressInterval)
            setIsGenerating(false)
            toast.error(error.response?.data?.error || "Failed to generate tickets")
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-zinc-950">
                <Loader2 className="animate-spin text-orange-500 h-8 w-8" />
            </div>
        )
    }

    return (
        <div className="md:p-10 p-6 w-full space-y-8 min-h-screen bg-zinc-950 text-white pb-20">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col space-y-4">
                    <Link href={`/u/a/events/${id}`} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm w-fit group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Event
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight uppercase tracking-tighter">
                                Generate Tickets Sale
                            </h1>
                            <p className="text-zinc-400 mt-2">
                                Configure batches for <strong className="text-white">{event?.title || event?.homeTeam}</strong>.
                            </p>
                        </div>
                        <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
                            {Object.entries(existingSummary).map(([stand, count]) => (
                                <div key={stand} className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl flex flex-col items-center min-w-[100px]">
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{stand}</span>
                                    <span className="text-lg font-black text-white">{count}</span>
                                </div>
                            ))}
                            <div className="bg-orange-500/10 border border-orange-500/20 px-6 py-2 rounded-xl flex flex-col items-center min-w-[120px]">
                                <span className="text-[10px] font-black text-orange-500/70 uppercase tracking-widest mb-1">TOTAL FOR SALE</span>
                                <span className="text-xl font-black text-orange-500">{existingCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {!isGenerated ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2 bg-zinc-900 border-zinc-800 shadow-xl text-white">
                            <CardHeader className="border-b border-zinc-800">
                                <CardTitle className="text-xl font-black flex items-center gap-2">
                                    <Plus className="text-orange-500" /> Define Batches
                                </CardTitle>
                                <CardDescription className="text-zinc-400">Add different stands and the amount of tickets to create for each.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-4">
                                    {batches.map((batch, index) => (
                                        <div key={index} className="flex flex-col md:flex-row md:items-end gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800 relative group animate-in slide-in-from-left duration-300">
                                            <div className="flex-1 space-y-2">
                                                <Label className="text-zinc-400 text-xs font-bold uppercase">Stand / Ticket Type</Label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Popular Stand"
                                                    value={batch.stand}
                                                    onChange={(e) => updateBatch(index, 'stand', e.target.value)}
                                                    className="w-full bg-zinc-900 border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="w-full md:w-32 space-y-2">
                                                <Label className="text-zinc-400 text-xs font-bold uppercase">Quantity</Label>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={batch.quantity || ''}
                                                    onChange={(e) => updateBatch(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    className="w-full bg-zinc-900 border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                                                />
                                            </div>
                                            {batches.length > 1 && (
                                                <button
                                                    onClick={() => removeBatch(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        onClick={addBatch}
                                        className="w-full border-dashed border-zinc-700 hover:border-orange-500 hover:bg-orange-500/5 text-zinc-400 hover:text-orange-500 py-6 transition-all"
                                    >
                                        <Plus className="mr-2" /> Add Another Batch
                                    </Button>
                                </div>

                                <div className="pt-4 border-t border-zinc-800 space-y-4">
                                    <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-lg">
                                        <span className="text-zinc-400 font-medium tracking-tight">Total to generate:</span>
                                        <span className={`text-2xl font-black ${totalTickets > 400 ? 'text-red-500' : 'text-white'}`}>
                                            {totalTickets} <span className="text-sm font-normal text-zinc-500">/ 400 max</span>
                                        </span>
                                    </div>

                                    {isGenerating ? (
                                        <div className="space-y-4 py-4">
                                            <div className="flex justify-between items-center text-xs text-orange-500 font-black uppercase tracking-widest">
                                                <span>Creating Tickets...</span>
                                                <span>{genProgress}%</span>
                                            </div>
                                            <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-orange-500 transition-all duration-300 ease-out"
                                                    style={{ width: `${genProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={totalTickets === 0 || totalTickets > 400}
                                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black h-16 text-xl rounded-2xl shadow-lg border-2 border-orange-500/50 uppercase tracking-tighter"
                                        >
                                            Generate Tickets For Sale
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-zinc-900 border-zinc-800 shadow-xl text-white">
                            <CardHeader>
                                <CardTitle className="text-lg font-black italic uppercase tracking-tighter">Instructions</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-zinc-400 space-y-4">
                                <p>Once generated, these tickets will be available in the <strong>Print Tickets For Sale</strong> section for batch printing.</p>
                                <ul className="list-disc pl-4 space-y-2">
                                    <li>Enter the name of the stand or ticket category.</li>
                                    <li>Tickets will be assigned a unique QR code and ID automatically.</li>
                                    <li>You can generate up to <strong>400 tickets</strong> per action.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card className="bg-zinc-900 border-orange-500/30 shadow-xl text-white overflow-hidden relative border-t-4 border-t-orange-500 animate-in zoom-in-95 duration-500">
                        <CardContent className="pt-20 pb-20 flex flex-col items-center text-center space-y-8">
                            <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center animate-bounce">
                                <CheckCircle className="w-12 h-12 text-black" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Tickets Generated Successfully!</h1>
                                <p className="text-zinc-400 max-w-md mx-auto">
                                    Your batches have been created in the system. You can now download and print them.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                                <Button asChild className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-black h-14">
                                    <Link href={`/u/a/events/${id}/tickets-for-sale`}>
                                        <Download className="mr-2 h-5 w-5" /> Proceed to Printing
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        // Update summary locally for immediate feedback
                                        const newSummary = { ...existingSummary }
                                        batches.forEach(b => {
                                            if (b.quantity > 0) {
                                                const stand = b.stand || "Regular"
                                                newSummary[stand] = (newSummary[stand] || 0) + b.quantity
                                            }
                                        })
                                        setExistingSummary(newSummary)
                                        setExistingCount(prev => prev + totalTickets)

                                        setIsGenerated(false)
                                        setBatches([{ stand: 'Popular', quantity: 0 }])
                                    }}
                                    className="flex-1 border-zinc-800 text-white hover:bg-zinc-900 h-14 font-bold"
                                >
                                    Generate More
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
