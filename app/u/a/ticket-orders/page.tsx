"use client"
import React, { useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Loader2, FileText, CheckCircle, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import api from '@/lib/axios'

export default function TicketOrdersPage() {
    const [email, setEmail] = useState('')
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim() || !email.includes('@')) {
            toast.error("Please enter a valid email address.")
            return
        }
        
        setLoading(true)
        setSearched(true)
        try {
            const res = await api.get(`/admin/ticket-orders?email=${encodeURIComponent(email)}`)
            if (res.data.success) {
                setOrders(res.data.orders || [])
            } else {
                setOrders(res.data.orders || [])
            }
        } catch (error) {
            console.error("Search failed", error)
            toast.error("Failed to fetch ticket orders")
        } finally {
            setLoading(false)
        }
    }
    const getTicketItems = (ticketsData: any) => {
        if (!ticketsData) return [];
        if (Array.isArray(ticketsData)) return ticketsData;
        
        return Object.entries(ticketsData).map(([key, val]: [string, any]) => {
            if (typeof val === 'number') {
                return { name: key, quantity: val };
            }
            return {
                name: val?.name || key,
                quantity: val?.quantity || val?.qty || 1,
                price: val?.price || 0
            };
        });
    }

    const [generating, setGenerating] = useState<string | null>(null)

    const handleGenerate = async (reference: string) => {
        try {
            setGenerating(reference)
            const res = await api.get(`/ticket-order?reference=${reference}`)
            if (res.data.createdTickets || res.status === 200) {
                toast.success("Tickets generated successfully!")
                setOrders(prev => prev.map(o => o.reference === reference ? { ...o, isGenerated: true } : o))
            }
        } catch (error: any) {
            toast.error("Failed to generate tickets: " + (error.response?.data?.error || error.message))
        } finally {
            setGenerating(null)
        }
    }

    return (
        <div className='md:p-10 p-6 w-full space-y-10 min-h-screen'>
            <PageHeader title="Ticket Orders" />

            <Card className="bg-zinc-900 border-zinc-800 text-white shadow-xl max-w-4xl">
                <CardHeader>
                    <CardTitle className="text-xl">Search User Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-4 items-center">
                        <Input
                            type="email"
                            placeholder="Enter user email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-zinc-950 border-zinc-800 text-white flex-1"
                        />
                        <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white font-bold w-32">
                            {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : <><Search className="w-4 h-4 mr-2" /> Search</>}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="max-w-4xl space-y-4">
                {loading && (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                )}
                
                {!loading && searched && orders.length === 0 && (
                    <Card className="bg-zinc-900 border-zinc-800 text-white text-center p-12">
                        <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold">No orders found</h3>
                        <p className="text-zinc-500">No ticket orders found for this email address.</p>
                    </Card>
                )}

                {!loading && orders.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4">Found {orders.length} order{orders.length === 1 ? '' : 's'}</h3>
                        {orders.map((order) => (
                            <Card key={order._id} className="bg-zinc-900 border-zinc-800 text-white overflow-hidden shadow-lg">
                                <div className="border-b border-zinc-800 bg-zinc-950/50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-zinc-500 w-5 h-5" />
                                        <div>
                                            <p className="text-xs text-zinc-500 uppercase font-black tracking-wider">Order Reference</p>
                                            <p className="font-mono text-sm tracking-widest">{order.reference}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 text-xs font-bold uppercase tracking-wider">
                                        <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${order.paymentStatus === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                            {order.paymentStatus === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                            {order.paymentStatus}
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h4 className="font-black text-xl mb-1">{order.event ? (order.event.title || `${order.event.homeTeam} vs ${order.event.awayTeam}`) : 'Event Deleted'}</h4>
                                            <p className="text-zinc-400 text-sm">Purchased on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                        <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800/50 space-y-2">
                                            <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-2">Ticket Breakdown</p>
                                            {getTicketItems(order.tickets).map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-zinc-300">{item.name}</span>
                                                    <span className="font-bold">x{item.quantity}</span>
                                                </div>
                                            ))}
                                            <div className="border-t border-zinc-800 pt-2 mt-2 flex justify-between font-black text-orange-500 text-sm">
                                                <span>Total Tickets</span>
                                                <span>{getTicketItems(order.tickets).reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full md:w-64 space-y-4 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
                                       <div className="space-y-1">
                                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">User Info</p>
                                            <p className="text-sm font-medium">{order.user?.firstName} {order.user?.lastName}</p>
                                            <p className="text-xs text-zinc-400 truncate">{order.user?.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Generation Status</p>
                                            {order.isGenerated ? (
                                                <span className="inline-flex items-center gap-1 text-sm font-bold text-green-500">
                                                    <CheckCircle className="w-4 h-4" /> Generated
                                                </span>
                                            ) : (
                                                <div className="flex flex-col gap-2 mt-1">
                                                    <span className="inline-flex items-center gap-1 text-sm font-bold text-zinc-400">
                                                        <Clock className="w-4 h-4" /> Not Generated
                                                    </span>
                                                    <Button 
                                                        onClick={() => handleGenerate(order.reference)}
                                                        disabled={generating === order.reference}
                                                        size="sm"
                                                        className="bg-orange-600 hover:bg-orange-700 text-white w-full font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-900/20"
                                                    >
                                                        {generating === order.reference ? (
                                                            <><Loader2 className="w-3 h-3 animate-spin mr-2" /> Generating...</>
                                                        ) : (
                                                            "Generate Now"
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
