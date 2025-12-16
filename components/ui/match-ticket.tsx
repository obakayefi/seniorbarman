import {useQRCode} from "next-qrcode";
import {SiTarom} from "react-icons/si";
import {AlarmClock, Calendar} from "lucide-react";
import {SlLocationPin} from "react-icons/sl";
import {formattedDate} from "@/lib/utils";
import {MdOutlineEvStation, MdOutlineStadium} from "react-icons/md";
import {PiChair} from "react-icons/pi";

export default function MatchTicket({ticket}:{ticket: {}}) {
    const {Image} = useQRCode();
    // console.log({ticket});
    return (
        <section className={'max-w-96 min-w-fit border-1  p-2 border-zinc-800 flex flex-col gap-1 rounded-lg'}>
            <div className={'p-4 gap-1 items-center mb-2 text-center flex-col justify-center flex rounded'}>
                <h2 className={'text-xl'}>{ticket?.event.homeTeam}</h2>
                <span className={'text-zinc-600'}>vs</span>
                <h2 className={'text-xl'}>{ticket?.event.awayTeam}</h2>
            </div>

            <div className={'md:-mt-4 flex md:max-w-72 max-w-62 mx-auto overflow-hidden rounded-lg items-center justify-center mt-0 bg-transparent'}>
                <Image
                    text={`https://sbmdev.netlify.app/u/tickets/preview/${ticket?.checkInToken}/`}
                    options={{
                        type: 'image/jpeg',
                        quality: 0.3,
                        errorCorrectionLevel: 'M',
                        margin: 2,
                        scale: 3,
                        width: 210,
                        color: {
                            dark: '#010599FF',
                            light: '#FFF',
                        },
                    }}
                />
            </div>
            
            <div className={'p-4 flex sm:flex-row flex-col gap-2 justify-between'}>
                <section className={'text-xs'}>
                    <h4 className={'text-zinc-600 font-semibold'}>DATE</h4>
                    <div className={'flex items-gap items-center gap-1'}>
                        <span className={'text-red-500'}><Calendar size={16}/></span>
                        <span> {formattedDate(ticket.event.date)}</span>
                    </div>
                </section>

                <section className={'text-xs flex flex-col justify-center items-end'}>
                    <h4 className={'text-zinc-600 font-semibold'}>VENUE</h4>
                    <div className={'flex items-gap items-center gap-1'}>
                        <span className={'text-red-500'}><MdOutlineStadium size={16}/></span>
                        <span> {ticket?.event?.venue}</span>
                    </div>
                </section>
            </div>
            
            <div className={'p-4 flex sm:flex-row flex-col gap-2 justify-between'}>
                <section className={'text-xs'}>
                    <h4 className={'text-zinc-600 font-semibold'}>TIME</h4>
                    <div className={'flex items-gap items-center gap-1'}>
                        <span className={'text-red-500'}><AlarmClock size={16}/></span>
                        <span> 16:00</span>
                    </div>
                </section>                

                <section className={'text-xs flex flex-col justify-end items-end'}>
                    <h4 className={'text-zinc-600 font-semibold'}>SEAT</h4>
                    <div className={'flex items-gap items-center gap-1'}>
                        <span className={'text-red-500'}><PiChair size={16}/></span>
                        <span>{ticket.stand}</span>
                    </div>
                </section>
            </div>
        </section>
    )
}