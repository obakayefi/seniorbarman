"use client"
import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Search, Edit, Eye, MapPin, Ticket } from "lucide-react"
import api from "@/lib/axios"
import Link from 'next/link'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function OrganizerManageEventsPage() {
    const router = useRouter()
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

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
        const matchesSearch =
            (event.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (event.venue?.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesSearch;
    })

    return (
        <div className="md:p-10 p-6 w-full space-y-10 min-h-screen bg-zinc-950 text-white">
            <PageHeader
                title="My Events"
                description="Manage the events you have created."
            />

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-white">Your Activities</CardTitle>
                        <CardDescription className="text-zinc-400">View details and tickets for your events</CardDescription>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-zinc-950 border-zinc-700 w-full sm:w-64"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                            <p className="font-medium">Fetching your events...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-zinc-950/50">
                                <TableRow className="border-zinc-800">
                                    <TableHead className="text-zinc-400">Activity</TableHead>
                                    <TableHead className="text-zinc-400">Type</TableHead>
                                    <TableHead className="text-zinc-400">Date & Time</TableHead>
                                    <TableHead className="text-zinc-400">Venue</TableHead>
                                    <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEvents.map((event) => (
                                    <TableRow
                                        key={event._id}
                                        onClick={() => router.push(`/u/organizer/events/${event._id}`)}
                                        className="border-zinc-800 hover:bg-zinc-900 transition-colors group cursor-pointer"
                                    >
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white group-hover:text-orange-400 transition-colors">
                                                    {event.title}
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-mono uppercase">{event._id.slice(-8)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize border-purple-500/30 text-purple-400">
                                                {event.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-zinc-300 text-sm">{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                                                <span className="text-zinc-500 text-xs">{format(new Date(event.date), 'HH:mm')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-zinc-500 text-sm">
                                                <MapPin size={14} className="shrink-0" />
                                                <span className="truncate max-w-[150px]">{event.venue}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right p-4">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                <Button size="icon" variant="outline" asChild className="h-8 w-8 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-orange-400">
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
                                        <TableCell colSpan={5} className="text-center py-20 text-zinc-600">
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
