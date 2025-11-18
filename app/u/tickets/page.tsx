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
import { useParams } from 'next/navigation'

const Tickets = () => {
  const [eventsWithTickets, setEventsWithTickets] = useState([])
  const [loading, setLoading] = useState(true)
  // const  { eventNumber } = us()

  useEffect(() => {
    // console.log({ eventNumber: eventNumber ?? "Nada" });

  }, [])


  useEffect(() => {
    async function getTickets() {
      const data = await api(`/tickets?event-number${3141048014}`)
      console.log({ tickets_are: data.data.tickets })
      setEventsWithTickets(data.data.tickets)
      setLoading(false)
    }

    getTickets()
  }, [])

  return (
    <div className='p-10 w-full'>
      <PageHeader title='Tickets'>
        {/* <Button title='Create Ticket' className='px-6 bg-orange-500 py-5 active:translate-x-2 duration-200'>Create Ticket <TicketPlus /></Button> */}
        {""}
      </PageHeader>
      <section>
        {loading ? (
          <div className='flex items-center gap-1'>
            <Spinner />
            <h2 className='text-slate-400'>Loading Tickets</h2>
          </div>
        ) : eventsWithTickets.length === 0 ? (
          <div className='flex flex-col gap-2'>
            <h2 className="text-4xl">No Tickets</h2>
            <p>Purchase a ticket</p>
          </div>
        ) : (
          <div className='flex flex-col lg:grid grid-cols-2 gap-6 mt-20'>
            {eventsWithTickets.map((event: any) => (
              // <Ticket ticket={ticket} key={ticket._id} />
              <EventTicket event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Tickets