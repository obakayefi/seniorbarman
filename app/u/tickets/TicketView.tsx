"use client"
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import api from '@/lib/axios'
import { TicketPlus } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import Ticket from './Ticket'
import { Spinner } from '@/components/ui/spinner'
import EventTicket from './EventTicket'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from "@/context/AppContext";
//import { redis } from '@/lib/redis'

const TicketsPageView = () => {
    const [eventsWithTickets, setEventsWithTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [ticketSummary, setTicketSummary] = useState([])
    const { user } = useApp()
    const router = useRouter()
    const [viewMode, setViewMode] = useState<'sports' | 'event'>('sports')


    useEffect(() => {
        async function getTickets() {
            const data = await fetch(`/api/tickets?event-number${3141048014}`)
            const json = await data.json()
            setEventsWithTickets(json.tickets)
            setTicketSummary(json.summary)
            setLoading(false)
        }

        getTickets()
    }, [])

    const filteredTickets = eventsWithTickets
        .filter((t: any) => {
            // Handle potential nested event structure or direct property
            const type = t.type || t.event?.type || (t.homeTeam ? 'sports' : 'event'); // Fallback logic if type is missing but homeTeam exists
            return type === viewMode;
        })
        // Sort from most recently created/purchased to oldest
        .sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || a.date || 0).getTime();
            const dateB = new Date(b.createdAt || b.date || 0).getTime();
            return dateB - dateA;
        });


    return (
        <div className='p-6 md:p-10 w-full max-w-7xl mx-auto'>
            <PageHeader title='Tickets'>
                <div />
            </PageHeader>

            {/* Toggle Switch Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 mb-4 w-full">
                <div className="flex items-center p-1 bg-muted border border-border rounded-sm w-full sm:w-fit">
                    <button
                        onClick={() => setViewMode('sports')}
                        className={`flex-1 sm:flex-none px-6 sm:px-10 py-2.5 rounded-sm text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${viewMode === 'sports' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Football Matches
                    </button>
                    <button
                        onClick={() => setViewMode('event')}
                        className={`flex-1 sm:flex-none px-6 sm:px-10 py-2.5 rounded-sm text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${viewMode === 'event' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Events
                    </button>
                </div>
            </div>

            <section>
                {loading ? (
                    <div className='flex items-center gap-2'>
                        <Spinner />
                        <h2 className='text-muted-foreground text-sm font-semibold'>Loading Tickets</h2>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className='flex flex-col gap-2 py-10'>
                        <h2 className="text-3xl font-black text-foreground uppercase">No {viewMode === 'sports' ? 'Football' : 'Event'} Tickets</h2>
                        <p className="text-muted-foreground text-sm">You haven't purchased any tickets for this category yet.</p>
                    </div>
                ) : (
                    <div className='flex flex-col lg:grid grid-cols-2 gap-6 mt-10'>
                        {filteredTickets.map((event: any) => (
                            // <Ticket ticket={ticket} key={ticket._id} />
                            <EventTicket summary={ticketSummary} key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

export default TicketsPageView