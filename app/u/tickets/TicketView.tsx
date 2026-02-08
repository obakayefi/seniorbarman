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

const TicketsPageView = () => {
    const [eventsWithTickets, setEventsWithTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [ticketSummary, setTicketSummary] = useState([])
    const { user } = useApp()
    const router = useRouter()
    const [viewMode, setViewMode] = useState<'sports' | 'event'>('sports')


    useEffect(() => {
        async function getTickets() {
            const data = await api(`/tickets?event-number${3141048014}`)
            setEventsWithTickets(data.data.tickets)
            setTicketSummary(data.data.summary)
            //console.log({data, summary: data.data.summary})
            setLoading(false)
        }

        getTickets()
    }, [])

    const filteredTickets = eventsWithTickets.filter((t: any) => {
        // Handle potential nested event structure or direct property
        const type = t.type || t.event?.type || (t.homeTeam ? 'sports' : 'event'); // Fallback logic if type is missing but homeTeam exists
        return type === viewMode;
    });


    return (
        <div className='p-6 md:p-10 w-full max-w-7xl mx-auto'>
            <PageHeader title='Tickets'>
                <div />
            </PageHeader>

            {/* Toggle Switch Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 mb-4 w-full">
                <div className="flex items-center p-1 bg-zinc-900/50 border border-zinc-800 rounded-full backdrop-blur-sm w-full sm:w-fit">
                    <button
                        onClick={() => setViewMode('sports')}
                        className={`flex-1 sm:flex-none px-6 sm:px-10 py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 ${viewMode === 'sports' ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Football Matches
                    </button>
                    <button
                        onClick={() => setViewMode('event')}
                        className={`flex-1 sm:flex-none px-6 sm:px-10 py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 ${viewMode === 'event' ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Events
                    </button>
                </div>
            </div>



            <section>
                {loading ? (
                    <div className='flex items-center gap-1'>
                        <Spinner />
                        <h2 className='text-slate-400'>Loading Tickets</h2>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className='flex flex-col gap-2'>
                        <h2 className="text-4xl text-zinc-600">No {viewMode === 'sports' ? 'Football' : 'Event'} Tickets</h2>
                        <p className="text-zinc-500">You haven't purchased any tickets for this category yet.</p>
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