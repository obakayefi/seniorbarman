import { TicketStandIcon } from '@/components/icons'
import { TicketIcon } from 'lucide-react'
import Image from 'next/image'

const Ticket = ({ ticket }: { ticket: any }) => {
    return (
        <div className='flex hover:bg-gray-100/50 duration-200 border-2 border-gray-100 p-2 rounded'>
            <section className='flex flex-col gap-2  overflow-hidden'>
                {/* <section className='h-36 border-2 border-slate-300 w-36 items-center flex justify-center rounded-full bg-slate-200'> */}
                <Image className='border-2 border-gray-100 rounded' alt='ticket qr code' src={ticket.qrCode} width={200} height={100} />
                <p className='bg-[#3C3C3C] px-4 text-center py-2 text-[#9D9D9D] rounded'>{ticket.status}</p>
            </section>
            <section className='flex items-center justify-between w-full flex-col'>
                <div className='flex mx-auto items-center gap-4'>
                    <h2 className='text-2xl'>{ticket.event.homeTeam}</h2>
                    <p className='text-gray-400 font-semibold'>vs</p>
                    <h2 className='text-2xl'>{ticket.event.awayTeam}</h2>
                </div>
                <div className='flex items-center gap-2 justify-between'>
                    <p className='text-orange-400'>{(new Date(ticket.event.date)).toDateString()}</p>
                    <div className='bg-gray-200 w-10 h-4 rounded'/>
                    <p className='text-orange-400'>{ticket.event.time}</p>
                </div>
                <div>

                    <p className='bg-[#F5F5F5] flex items-center gap-2 px-4 py-2'>
                        <span><TicketStandIcon size={24} /></span>
                        <span>{ticket.stand}</span>
                    </p>
                </div>
            </section>
        </div>
    )
}

export default Ticket