import { TicketStandIcon } from '@/components/icons'
import { TicketIcon } from 'lucide-react'
import Image from 'next/image'

const Ticket = ({ ticket }: { ticket: any }) => {

    const status_checkedIn = ticket.status === "Checked In"
    const status_checkedOut = ticket.status === "Checked Out"
    const status_notCheckedIn = ticket.status === "Not Checked In"

    const statusBgColor = status_checkedIn ? "bg-green-200 text-green-500" : status_checkedOut ? "bg-red-200 text-red-500 " : status_notCheckedIn ? "bg-slate-800 text-slate-200" : null

    return (
        <div className='flex flex-col md:flex-row items-center hover:bg-gray-100/50 duration-200 border-2 border-gray-100 p-2 rounded'>
            <section className='flex flex-col gap-2 flex-col-reverse md:flex-col overflow-hidden'>
                {/* <section className='h-36 border-2 border-slate-300 w-36 items-center flex justify-center rounded-full bg-slate-200'> */}
                <Image className='border-2 flex  border-gray-100 rounded' alt='ticket qr code' src={ticket.qrCode} width={200} height={100} />
                <p className={`bg-[#3C3C3C] text-xs uppercase text-center py-1 text-[#9D9D9D] rounded ${statusBgColor}`}>{ticket.status}</p>
            </section>
            <section className='flex items-center justify-between gap-8 w-full mt-4 md:mt-0 flex-col'>
                <div className='flex mx-auto items-center md:flex-row flex-col gap-2'>
                    <h2 className='text-xl'>{ticket.event.homeTeam}</h2>
                    <p className='text-gray-400 font-semibold'>vs</p>
                    <h2 className='text-xl'>{ticket.event.awayTeam}</h2>
                </div>

                <div className='flex items-center gap-2 justify-between'>
                    <p className='text-orange-400'>{(new Date(ticket.event.date)).toDateString()}</p>
                    <div className='bg-gray-200 w-10 h-4 rounded' />
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