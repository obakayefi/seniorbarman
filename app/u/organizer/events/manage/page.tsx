"use client"
import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Search, Edit, Eye, MapPin, Ticket, Share2, Wallet } from "lucide-react"
import api from "@/lib/axios"
import Link from 'next/link'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { ShareEventModal } from '@/components/modals/share-event-modal'

export default function OrganizerManageEventsPage() {
    const router = useRouter()
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedShareEvent, setSelectedShareEvent] = useState<any>(null)

    const fetchEvents = async () => {
        try {
            setLoading(true)
            const res = await api.get('/organizer/events')
            if (res.data.success) {
                setEvents(res.data.events)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load your events")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    const filteredEvents = events.filter(event => {
        const titleStr = event.type === 'sports' 
            ? `${event.homeTeam?.name || ''} vs ${event.awayTeam?.name || ''}` 
            : (event.title || '');
        const matchesSearch =
            (titleStr.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (event.venue?.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesSearch;
    })

    return (
        <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8 min-h-screen bg-background text-foreground pb-20">
            <PageHeader
                title="My Events"
                description="Manage the events you have created."
            />

            <Card className="bg-card border-border dark:border-zinc-800 rounded-sm shadow-sm p-5 sm:p-6 gap-0">
                <CardHeader className="border-b border-border dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 pt-0 px-0">
                    <div>
                        <CardTitle className="text-foreground text-lg font-bold">Your Activities</CardTitle>
                        <CardDescription className="text-muted-foreground text-xs mt-1">View details, tickets, and orders for your events</CardDescription>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-background border-border dark:border-zinc-800 text-foreground w-full sm:w-64 rounded-sm text-xs h-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 pt-4 overflow-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                            <p className="font-medium">Fetching your events...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/40 dark:bg-zinc-900/40 border-b border-border dark:border-zinc-800">
                                <TableRow className="border-border dark:border-zinc-800">
                                    <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold py-3.5 px-4">Activity</TableHead>
                                    <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold py-3.5 px-4">Type</TableHead>
                                    <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold py-3.5 px-4">Date & Time</TableHead>
                                    <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold py-3.5 px-4">Venue</TableHead>
                                    <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold text-right py-3.5 px-4">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEvents.map((event) => (
                                    <TableRow
                                        key={event._id}
                                        onClick={() => router.push(`/u/organizer/events/${event._id}`)}
                                        className="border-border/60 dark:border-zinc-800/60 hover:bg-muted/30 dark:hover:bg-zinc-850/50 transition-colors group cursor-pointer"
                                    >
                                        <TableCell className="py-3.5 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground group-hover:text-orange-500 transition-colors">
                                                    {event.type === 'sports' ? `${event.homeTeam?.name || event.homeTeam} vs ${event.awayTeam?.name || event.awayTeam}` : event.title}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-mono uppercase">{event._id.slice(-8)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3.5 px-4">
                                            <Badge variant="outline" className="capitalize border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10 text-[10px] font-bold rounded-xs">
                                                {event.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3.5 px-4">
                                            <div className="flex flex-col">
                                                <span className="text-foreground text-sm font-medium">{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                                                <span className="text-muted-foreground text-xs">{format(new Date(event.date), 'HH:mm')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3.5 px-4">
                                            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                                <MapPin size={14} className="shrink-0 text-orange-500" />
                                                <span className="truncate max-w-[150px]">{event.venue}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right py-3.5 px-4">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                <Button size="icon" variant="outline" asChild title="View Ticket Orders" className="h-8 w-8 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-sm shadow-xs">
                                                    <Link href={`/u/organizer/events/${event._id}/orders`}>
                                                        <Wallet size={14} />
                                                    </Link>
                                                </Button>
                                                <Button size="icon" variant="outline" asChild title="View Event Details" className="h-8 w-8 border-border dark:border-zinc-800 bg-card hover:bg-muted text-foreground hover:text-orange-500 rounded-sm shadow-xs">
                                                    <Link href={`/u/organizer/events/${event._id}`}>
                                                        <Eye size={14} />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredEvents.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic text-sm">
                                            No events found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
