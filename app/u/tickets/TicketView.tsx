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
        <div className='p-10 w-full'>
            <PageHeader title='Tickets'>
                {/* <Button title='Create Ticket' className='px-6 bg-orange-500 py-5 active:translate-x-2 duration-200'>Create Ticket <TicketPlus /></Button> */}
                {""}
                {/* Toggle Switch */}
                <div className="flex items-center gap-4 mb-6 mt-2 pb-4">
                    <button
                        onClick={() => setViewMode('sports')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${viewMode === 'sports' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Football Matches
                    </button>
                    <button
                        onClick={() => setViewMode('event')}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${viewMode === 'event' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Events
                    </button>
                </div>
            </PageHeader>



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