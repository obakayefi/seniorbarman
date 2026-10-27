"use client"
import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Search, Edit, Trash2, Calendar, MapPin, Ticket, Filter, ExternalLink, Eye } from "lucide-react"
import api from "@/lib/axios"
import Link from 'next/link'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function EventManagementPage() {
    const router = useRouter()
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState('all')

    const fetchEvents = async () => {
        try {
            setLoading(true)
            const res = await api.get('/admin/events')
            if (res.data.success) {
                setEvents(res.data.events)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load events")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    const filteredEvents = events.filter(event => {
        const matchesSearch =
            (event.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (event.homeTeam?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (event.awayTeam?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (event.venue?.toLowerCase().includes(searchQuery.toLowerCase()));

        if (filterType === 'application') {
            return matchesSearch && Boolean(event.requiresApplication);
        }
        if (filterType === 'tickets') {
            return matchesSearch && Array.isArray(event.ticketTypes) && event.ticketTypes.length > 0;
        }

        const matchesType = filterType === 'all' || event.type === filterType;
        return matchesSearch && matchesType;
    })

    const handleDelete = async (id: string, type: string) => {
        if (!confirm("Are you sure? This will nullify all associated tickets.")) return;

        const deleteTickets = confirm("Do you also want to delete all tickets associated with this event?");

        try {
            if (deleteTickets) {
                await api.delete(`/tickets?eventId=${id}`);
            }
            const res = await api.delete(`/events/${id}${type === 'event' ? '?type=event' : ''}`);
            if (res.status === 200) {
                toast.success("Event deleted successfully");
                fetchEvents();
            }
        } catch (error) {
            toast.error("Failed to delete event");
        }
    }

    return (
        <div className="md:p-10 p-6 w-full space-y-10 min-h-screen bg-background text-foreground">
            <PageHeader
                title="Event Management"
                description="Manage all events and football matches in the system."
            >
                <div className="flex gap-2">
                    <Button asChild className="bg-orange-600 hover:bg-orange-700">
                        <Link href="/u/a/events/create">
                            <Calendar className="mr-2 h-4 w-4" /> Create Event
                        </Link>
                    </Button>
                </div>
            </PageHeader>

            <Card className="">
                <CardHeader className="-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-foreground">All Activities</CardTitle>
                        <CardDescription className="text-muted-foreground">Past, current and future events</CardDescription>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-background border-border w-full sm:w-64"
                            />
                        </div>
                        <div className="flex flex-wrap bg-muted rounded-sm border border-border p-1 gap-1">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-3 py-1 text-xs rounded-sm transition-all ${filterType === 'all' ? 'bg-card text-foreground font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterType('event')}
                                className={`px-3 py-1 text-xs rounded-sm transition-all ${filterType === 'event' ? 'bg-card text-foreground font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Events
                            </button>
                            <button
                                onClick={() => setFilterType('sports')}
                                className={`px-3 py-1 text-xs rounded-sm transition-all ${filterType === 'sports' ? 'bg-card text-foreground font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Sports
                            </button>
                            <button
                                onClick={() => setFilterType('application')}
                                className={`px-3 py-1 text-xs rounded-sm transition-all ${filterType === 'application' ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Application Req.
                            </button>
                            <button
                                onClick={() => setFilterType('tickets')}
                                className={`px-3 py-1 text-xs rounded-sm transition-all ${filterType === 'tickets' ? 'bg-green-500/20 text-green-400 font-bold border border-green-500/30' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Tickets Selling
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                            <p className="font-medium">Fetching events...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-border">
                                    <TableHead className="text-muted-foreground">Activity</TableHead>
                                    <TableHead className="text-muted-foreground">Type</TableHead>
                                    <TableHead className="text-muted-foreground">Ticket Sales</TableHead>
                                    <TableHead className="text-muted-foreground">Application Req.</TableHead>
                                    <TableHead className="text-muted-foreground">Date & Time</TableHead>
                                    <TableHead className="text-muted-foreground">Venue</TableHead>
                                    <TableHead className="text-muted-foreground">Creator</TableHead>
                                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEvents.map((event) => {
                                    const hasTickets = Array.isArray(event.ticketTypes) && event.ticketTypes.length > 0;
                                    const requiresApp = Boolean(event.requiresApplication);

                                    return (
                                        <TableRow
                                            key={event._id}
                                            onClick={() => router.push(`/u/a/events/${event._id}`)}
                                            className="border-border hover:bg-muted/50 transition-colors group cursor-pointer"
                                        >
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground group-hover:text-orange-400 transition-colors">
                                                        {event.type === 'sports'
                                                            ? `${event.homeTeam?.name || event.homeTeam || 'Home'} vs ${event.awayTeam?.name || event.awayTeam || 'Away'}`
                                                            : event.title}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-mono uppercase">{event._id.slice(-8)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`capitalize ${event.type === 'sports' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-purple-500/30 text-purple-400 bg-purple-500/10'}`}>
                                                    {event.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {hasTickets ? (
                                                    <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
                                                        🟢 {event.ticketTypes.length} Ticket Tier(s)
                                                    </Badge>
                                                ) : event.allowNoTickets ? (
                                                    <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px]">
                                                        🟡 Free / No Tickets
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 text-[10px]">
                                                        🔴 Sales Disabled
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {requiresApp ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        <Badge className="bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[10px] w-fit">
                                                            📋 Application Req.
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {event.applicationFee ? `Fee: ₦${event.applicationFee.toLocaleString()}` : 'Free Application'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Badge className="bg-muted text-muted-foreground border border-border text-[10px]">
                                                        ⚡ Direct Booking
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-foreground text-sm">{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                                                    <span className="text-muted-foreground text-xs">{format(new Date(event.date), 'HH:mm')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                                    <MapPin size={14} className="shrink-0" />
                                                    <span className="truncate max-w-[130px]">{event.venue}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-foreground text-sm font-bold">
                                                        {event.createdBy?.firstName} {event.createdBy?.lastName}
                                                    </span>
                                                    <span className="text-muted-foreground text-[10px] lowercase truncate max-w-[130px]">
                                                        {event.createdBy?.email}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right p-4">
                                                <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                    <Button size="icon" variant="outline" asChild className="h-8 w-8 border-border bg-muted hover:bg-muted/80 text-orange-400">
                                                        <Link href={`/u/a/events/${event._id}`}>
                                                            <Eye size={14} />
                                                        </Link>
                                                    </Button>
                                                    <Button size="icon" variant="outline" asChild className="h-8 w-8 border-border bg-muted hover:bg-muted/80">
                                                        <Link href={`/u/a/events/${event._id}/edit`}>
                                                            <Edit size={14} />
                                                        </Link>
                                                    </Button>
                                                    <Button size="icon" variant="outline" asChild className="h-8 w-8 border-border bg-muted hover:bg-muted/80 text-blue-400">
                                                        <Link href={`/u/a/events/${event._id}/print-tickets`}>
                                                            <Ticket size={14} />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(event._id, event.type)}
                                                        className="h-8 w-8 bg-red-950/30 hover:bg-red-600 text-red-500 hover:text-foreground"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {filteredEvents.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-20 text-muted-foreground">
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

