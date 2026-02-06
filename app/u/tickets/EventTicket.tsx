import { MdStadium } from "react-icons/md"
import { BsFillCalendarDateFill } from "react-icons/bs";
import { FaClock } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { CLUBS, extractTicketStatus, formatTime, giveLogo } from "@/lib/utils";

const EventTicket = ({ event, summary }: { event: any, summary: any }) => {
    return (
        <>
            {event.type === "sports" ? (
                <Link href={`/u/tickets/${event._id}`}>
                    <div
                        className='group border-2 border-zinc-900 hover:border-orange-500/50 hover:bg-zinc-900/50 cursor-pointer duration-500 bg-zinc-900/40 backdrop-blur-xl flex flex-col rounded-2xl shadow-xl overflow-hidden min-h-[350px]'>
                        <section className="flex justify-between border-b border-white/5 p-4 px-6 bg-black/20">
                            <div className="flex items-center gap-2 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                <BsFillCalendarDateFill className="text-orange-500/60" />
                                <h3 className="text-xs font-black uppercase tracking-widest">{event?.date ? new Date(event.date).toLocaleDateString('en-GB') : 'N/A'}</h3>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                <h3 className="text-xs font-black uppercase tracking-widest">{formatTime(event?.time)}</h3>
                                <FaClock className="text-orange-500/60" />
                            </div>
                        </section>

                        <section className='flex items-center justify-center gap-4 py-8 px-6 flex-1'>
                            <div className="flex flex-col items-center gap-3 flex-1">
                                <div className="p-2 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                                    <Image
                                        src={giveLogo(event.homeTeam)}
                                        className={'w-10 h-10 object-contain'}
                                        width={75}
                                        alt="logo"
                                        height={100}
                                    />
                                </div>
                                <h2 className='text-sm sm:text-base font-black text-white text-center leading-tight tracking-tight'>{event.homeTeam}</h2>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <span className='text-[10px] font-black text-orange-500/40 uppercase tracking-[0.3em]'>VS</span>
                            </div>

                            <div className="flex flex-col items-center gap-3 flex-1">
                                <div className="p-2 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                                    <Image src={giveLogo(event.awayTeam)} className={'w-10 h-10 object-contain'} width={75} alt="logo"
                                        height={100} />
                                </div>
                                <h2 className='text-sm sm:text-base font-black text-white text-center leading-tight tracking-tight'>{event.awayTeam}</h2>
                            </div>
                        </section>

                        <div className="flex flex-col gap-4 p-6 bg-black/20 border-t border-white/5">
                            {event?.transformedSummary?.length > 0 ? (
                                <section className={'flex items-center flex-wrap gap-2 justify-center'}>
                                    {event?.transformedSummary.map((t: any) => {
                                        return (
                                            <div key={t.name} className='text-center bg-white/5 border border-white/5 backdrop-blur-md px-4 py-2 rounded-xl flex-1 min-w-[100px]'>
                                                <h4 className='text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1'>{t.name}</h4>
                                                <span className='text-xl font-black text-white'>{t.value}</span>
                                            </div>
                                        )
                                    })}
                                </section>
                            ) : (
                                <div className="text-center py-2 bg-red-500/5 border border-red-500/10 rounded-xl">
                                    <h2 className="text-sm font-black text-red-500/60 uppercase tracking-widest">No Tickets Purchased</h2>
                                </div>
                            )}

                            <div className="text-center flex items-center justify-center gap-3 pt-4 border-t border-white/5 group-hover:bg-orange-500/10 transition-all duration-500 -m-6 mt-2 p-4 px-6">
                                <MdStadium size={20} className="text-orange-500" />
                                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em] line-clamp-1">{event.venue}</h3>
                            </div>
                        </div>
                    </div>
                </Link>
            ) : event.type === "event" ? (
                <Link href={`/u/tickets/${event._id}`} className="overflow-hidden ">
                    <div
                        className='group relative border-2 border-zinc-900 hover:border-orange-500/50 cursor-pointer duration-500 flex flex-col rounded-2xl overflow-hidden min-h-[350px] shadow-2xl'
                        style={{
                            backgroundImage: `url(${event.image || 'https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/80 to-zinc-900/40 group-hover:via-zinc-950/70 transition-all duration-500" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col h-full justify-between flex-1">
                            <section className="flex justify-between items-center backdrop-blur-md bg-black/40 p-4 px-6 border-b rounded-t-2xl border-white/5">
                                <div className="flex items-center gap-2 text-zinc-300">
                                    <BsFillCalendarDateFill className="text-orange-500" size={14} />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest">{event?.date ? new Date(event.date).toLocaleDateString('en-GB') : 'N/A'}</h3>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-300">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest">{formatTime(event?.time)}</h3>
                                    <FaClock className="text-orange-500" size={14} />
                                </div>
                            </section>

                            <section className='flex flex-col items-center justify-center gap-4 py-8 px-6 flex-1'>
                                <span className="text-orange-500 text-[8px] font-black uppercase tracking-[0.4em] mb-[-10px]">Official Pass</span>
                                <h2 className='text-2xl lg:text-3xl font-black text-white text-center leading-tight tracking-tighter drop-shadow-2xl'>{event.title}</h2>
                            </section>

                            <div className="flex flex-col gap-6 p-6 pb-0">
                                {event?.transformedSummary?.length > 0 ? (
                                    <section className={'flex items-center gap-2 justify-center'}>
                                        {event?.transformedSummary.map((t: any) => {
                                            return (
                                                <div key={t.name} className='text-center bg-zinc-950/60 backdrop-blur-xl border border-white/10 flex-1 p-3 rounded-xl shadow-xl'>
                                                    <h4 className='text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-1'>{t.name}</h4>
                                                    <span className='text-xl font-black text-white'>{t.value}</span>
                                                </div>
                                            )
                                        })}
                                    </section>
                                ) : (
                                    <div className="text-center py-3 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-xl">
                                        <h2 className="text-[10px] font-black text-red-400 uppercase tracking-widest">No Tickets Purchased</h2>
                                    </div>
                                )}

                                <div className="text-center flex items-center justify-center gap-2 bg-black/60 backdrop-blur-md p-4 px-6 border-t border-white/5 group-hover:border-orange-500/30 transition-all rounded-b-2xl duration-500 -mx-6 mt-4">
                                    <MdStadium size={18} className="text-orange-500" />
                                    <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] line-clamp-1">{event.venue}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            ) : null}
        </>
    )
}

export default EventTicket