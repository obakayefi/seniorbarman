import {TicketStandIcon} from '@/components/icons'
import {TicketIcon} from 'lucide-react'
import Image from 'next/image'
import {useQRCode} from "next-qrcode";
import {extractTicketStatus} from "@/lib/utils";

const Ticket = ({ticket}: { ticket: any }) => {
    const {Image} = useQRCode();

    if (!ticket) return null

    const status_checkedIn = extractTicketStatus(ticket.checkInLogs) === "Checked In"
    const status_checkedOut = extractTicketStatus(ticket.checkInLogs) === "Checked Out"
    const status_notCheckedIn = extractTicketStatus(ticket.checkInLogs) === "Not Checked In"

    console.log({clientTicket: ticket, event: ticket.event, checkInLogs: status_checkedIn})

    const statusBgColor = status_checkedIn ? "bg-green-200 text-green-700" : status_checkedOut ? "bg-red-200 text-red-700 " : status_notCheckedIn ? "bg-slate-800 text-slate-200" : null

    const formattedDate = (_date: Date) => {
        console.log({formatted: _date})
        const date = new Date(_date)
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    }
    
    return (
        <div
            className='flex flex-col md:flex-row items-center hover:bg-gray-100/50 duration-200 border-2 border-gray-100 p-2 rounded gap-4'>
            <section className='flex gap-0 flex-col-reverse md:flex-col overflow-hidden'>
                <div>
                    <div className='bg-[#F5F5F5] flex justify-center items-center gap-1 px-4 py-2'>
                        <span><TicketStandIcon size={24}/></span>
                        <span>{ticket.stand}</span>
                    </div>
                    <div className='text-slate-700 flex flex-col items-center gap-2 text-center mt-2 mb-2'>
                        <h2 className="text-sm">{ticket.event.homeTeam}</h2>
                        <h2 className="text-sm bg-gray-200  rounded-full text-center h-6 w-6 flex items-center justify-center ">vs</h2>
                        <h2 className="text-sm">{ticket.event.awayTeam}</h2>
                    </div>
                    <div className='text-slate-700 gap-2 justify-center border-t-1 border-gray-200 pt-2 flex items-center text-center mb-3 '>
                        <h2 className="text-sm">{formattedDate(ticket.event.date)}</h2>
                        <span className={'text-gray-300'}>|</span>
                        <h2 className="text-sm">16:00</h2>
                    </div>
                </div>

                {/*<Image className='border-2 flex  border-gray-100 rounded' alt='ticket qr code' src={ticket.qrCode} width={300} height={100} />*/}
                <div className={'-mt-4 bg-transparent'}>
                    <Image
                        text={`https://sbmdev.netlify.app/u/tickets/preview/${ticket.checkInToken}/`}
                        options={{
                            type: 'image/jpeg',
                            quality: 0.3,
                            errorCorrectionLevel: 'M',
                            margin: 2,
                            scale: 4,
                            width: 200,
                            color: {
                                dark: '#010599FF',
                                light: '#FFF',
                            },
                        }}
                    />
                </div>
                <p className={`bg-[#3C3C3C] text-xs uppercase text-center py-1 text-[#9D9D9D] rounded ${statusBgColor}`}>{extractTicketStatus(ticket.checkInLogs)}</p>
            </section>
        </div>
    )
}

export default Ticket