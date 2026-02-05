import { MdStadium } from "react-icons/md"
import { BsFillCalendarDateFill } from "react-icons/bs";
import { FaClock } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { CLUBS, extractTicketStatus, formatTime, giveLogo } from "@/lib/utils";

const EventTicket = ({ event, summary }: { event: any, summary: any }) => {
    console.log({ NowEvent: event })

    return (
        <>
            {event.type === "sports" ? (
                <Link href={`/u/tickets/${event._id}`}>
                    <div
                        className='border-2 border-zinc-800 hover:bg-zinc-900/50 cursor-pointer duration-300 bg-zinc-900 p-2 flex flex-col gap-6 px-4 rounded'>
                        <section className="flex justify-between">
                            <div className="flex items-center gap-2 text-slate-500">
                                <BsFillCalendarDateFill />
                                <h3>{new Date(event?.date).toDateString()}</h3>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <h3>{formatTime(event?.time)}</h3>
                                <FaClock />
                            </div>
                        </section>

                        <section className='flex flex-col md:flex-row items-center justify-center gap-1'>
                            <div className="flex flex-col items-center">
                                <Image
                                    src={giveLogo(event.homeTeam)}
                                    className={'w-12 h-12'}
                                    width={75}
                                    alt="logo"
                                    height={100}
                                />
                                <h2 className='text-base lg:text-xl'>{event.homeTeam}</h2>
                            </div>
                            <span className='text-slate-400 mx-4'>vs</span>
                            <div className="flex flex-col items-center">
                                <Image src={giveLogo(event.awayTeam)} className={'w-12 h-12'} width={75} alt="logo"
                                    height={100} />
                                <h2 className='text-base lg:text-xl'>{event.awayTeam}</h2>
                            </div>
                        </section>

                        {event?.transformedSummary?.length > 0 ? (
                            <section className={'flex items-center flex-col sm:flex-row gap-2 justify-center text-center'}>
                                {event?.transformedSummary.map((t: any) => {
                                    //  console.log({t})
                                    return (
                                        <div key={t.name} className='text-center bg-zinc-700 hover:bg-zinc-800 lg:max-w-fit w-full p-2 px-3 rounded'>
                                            <h4 className='text-zinc-400'>{t.name}</h4>
                                            <span className='text-2xl text-zinc-200'>{t.value}</span>
                                        </div>
                                    )
                                })}
                            </section>
                        ) : (
                            <div>
                                <h2 className="text-2xl text-red-600">No Tickets Purchased</h2>
                            </div>
                        )}

                        <div className="text-center flex flex-col items-center justify-center">
                            <MdStadium size={32} className="text-orange-400" />
                            <h3 className="text-lg text-orange-400">{event.venue}</h3>
                        </div>
                    </div>
                </Link>
            ) : event.type === "event" ? (
                <Link href={`/u/tickets/${event._id}`}>
                    <div
                        className='relative border-2 border-zinc-900 hover:border-zinc-800 cursor-pointer duration-300 flex flex-col gap-6 rounded-lg overflow-hidden min-h-[300px]'
                        style={{
                            backgroundImage: `url(${event.image || 'https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-700/60 to-zinc-900/40" />

                        {/* Content */}
                        <div className="relative z-10 p-4 flex flex-col gap-6 h-full justify-between">
                            <section className="flex justify-between">
                                <div className="flex items-center gap-2 text-zinc-300">
                                    <BsFillCalendarDateFill />
                                    <h3>{new Date(event?.date).toDateString()}</h3>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-300">
                                    <h3>{formatTime(event?.time)}</h3>
                                    <FaClock />
                                </div>
                            </section>

                            <section className='flex flex-col items-center justify-center gap-3 flex-1'>
                                <h2 className='text-2xl lg:text-3xl font-bold text-white text-center'>{event.title}</h2>
                            </section>

                            {event?.transformedSummary?.length > 0 ? (
                                <section className={'flex items-center flex-col sm:flex-row gap-2 justify-center text-center'}>
                                    {event?.transformedSummary.map((t: any) => {
                                        return (
                                            <div key={t.name} className='text-center bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 lg:max-w-fit min-w-24 p-2 px-3 rounded'>
                                                <h4 className='text-zinc-400 text-sm'>{t.name}</h4>
                                                <span className='text-xl text-zinc-200'>{t.value}</span>
                                            </div>
                                        )
                                    })}
                                </section>
                            ) : (
                                <div className="text-center">
                                    <h2 className="text-xl text-red-400">No Tickets Purchased</h2>
                                </div>
                            )}

                            <div className="text-center flex flex-col items-center justify-center">
                                <MdStadium size={32} className="text-orange-400" />
                                <h3 className="text-lg text-orange-400">{event.venue}</h3>
                            </div>
                        </div>
                    </div>
                </Link>
            ) : null}
        </>
    )
}

export default EventTicket