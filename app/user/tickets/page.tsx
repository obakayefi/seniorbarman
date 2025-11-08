"use client"
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import api from '@/lib/axios'
import { TicketPlus } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import Ticket from './Ticket'

const Tickets = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getTickets() {
      const data = await api('/tickets')
      console.log({ tickets_are: data.data.tickets })
      setTickets(data.data.tickets)
      setLoading(false)
    }

    getTickets()
  }, [])
  return (
    <div className='p-10 w-full'>
      <PageHeader title='Tickets'>
        <Button title='Create Ticket' className='px-6 bg-orange-500 py-5 active:translate-x-2 duration-200'>Create Ticket <TicketPlus /></Button>
      </PageHeader>
      <section>
        {loading ? (
          <div>
            <h2>Loading events...</h2>
          </div>
        ) : tickets.length === 0 ? (
          <div className='flex flex-col gap-2'>
            <h2 className="text-4xl">No Tickets</h2>
            <p>Purchase a ticket</p>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-6 mt-20'>
            {tickets.map((ticket: any) => (
              <Ticket ticket={ticket} key={ticket._id} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Tickets