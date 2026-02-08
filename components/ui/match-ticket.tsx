import { useQRCode } from "next-qrcode";
import { SiTarom } from "react-icons/si";
import { AlarmClock, Calendar } from "lucide-react";
import { SlLocationPin } from "react-icons/sl";
import { formattedDate, formatTime, getBaseUrl } from "@/lib/utils";
import { MdOutlineEvStation, MdOutlineStadium } from "react-icons/md";
import { PiChair } from "react-icons/pi";

export default function MatchTicket({ ticket }: { ticket: any }) {
    const { Image } = useQRCode();

    return (
        <section className='w-full max-w-sm border-2 border-zinc-900 flex flex-col rounded-2xl bg-zinc-950/40 backdrop-blur-xl shadow-2xl overflow-hidden group hover:border-orange-500/30 transition-all duration-500'>
            <div className={'p-5 gap-1 items-center bg-black/40 border-b border-white/5 backdrop-blur-md transition-colors group-hover:bg-black/60'}>
                <div className="flex flex-col items-center gap-1">
                    <h2 className={'text-base sm:text-lg font-black text-white text-center leading-tight tracking-tight'}>{ticket?.event.homeTeam}</h2>
                    <span className={'text-orange-500/40 text-[10px] font-black uppercase tracking-[0.3em] my-1'}>vs</span>
                    <h2 className={'text-base sm:text-lg font-black text-white text-center leading-tight tracking-tight'}>{ticket?.event.awayTeam}</h2>
                </div>
            </div>

            <div className={'flex w-full mx-auto items-center justify-center p-6 bg-transparent flex-1'}>
                <div className="p-3 bg-white rounded-2xl shadow-inner shadow-black/20">
                    <Image
                        text={`${getBaseUrl()}/tickets/p/${ticket?.checkInToken}/`}
                        options={{
                            type: 'image/jpeg',
                            quality: 0.3,
                            errorCorrectionLevel: 'M',
                            margin: 1,
                            scale: 3,
                            width: 160,
                            color: {
                                dark: '#f97316',
                                light: '#FFF',
                            },
                        }}
                    />
                </div>
            </div>

            <div className={'p-5 grid grid-cols-2 gap-6 bg-black/20 border-t border-white/5'}>
                <section className={'flex flex-col gap-1'}>
                    <h4 className={'text-zinc-600 font-black text-[9px] uppercase tracking-widest'}>DATE</h4>
                    <div className={'flex items-center gap-2'}>
                        <Calendar size={14} className="text-orange-500" />
                        <span className="text-zinc-200 text-xs font-bold"> {formattedDate(ticket.event.date)}</span>
                    </div>
                </section>

                <section className={'flex flex-col gap-1 items-end'}>
                    <h4 className={'text-zinc-600 font-black text-[9px] uppercase tracking-widest'}>VENUE</h4>
                    <div className={'flex items-center gap-2 justify-end'}>
                        <span className="text-zinc-200 text-xs font-bold text-right line-clamp-1"> {ticket?.event?.venue}</span>
                        <MdOutlineStadium size={14} className="text-orange-500" />
                    </div>
                </section>

                <section className={'flex flex-col gap-1'}>
                    <h4 className={'text-zinc-600 font-black text-[9px] uppercase tracking-widest'}>TIME</h4>
                    <div className={'flex items-center gap-2'}>
                        <AlarmClock size={14} className="text-orange-500" />
                        <span className="text-zinc-200 text-xs font-bold"> {formatTime(ticket.event.time) || "16:00"}</span>
                    </div>
                </section>

                <section className={'flex flex-col gap-1 items-end'}>
                    <h4 className={'text-zinc-600 font-black text-[9px] uppercase tracking-widest'}>SEAT/TYPE</h4>
                    <div className={'flex items-center gap-2 justify-end'}>
                        <span className="text-orange-500 text-xs font-black tracking-tight uppercase"> {ticket.stand}</span>
                        <PiChair size={16} className="text-orange-500" />
                    </div>
                </section>
            </div>

            <div className="bg-orange-500/10 py-2 border-t border-white/5 text-center transition-colors group-hover:bg-orange-500/20">
                <span className="text-[8px] font-black text-orange-500 uppercase tracking-[0.3em]">Official Match Entry</span>
            </div>
        </section>
    )
}
