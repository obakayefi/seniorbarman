import {MdStadium} from "react-icons/md"
import {BsFillCalendarDateFill} from "react-icons/bs";
import {FaClock} from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import {CLUBS} from "@/lib/utils";

type EventProps = {
    summary: {}
    id: string,
    time: string,
    date: Date
}

const EventTicket = ({event, summary}: { event: EventProps, summary: string }) => {
    //console.log({NowEvent: event})

    const teamLogos = () => {
        let homeLogo, awayLogo;

        homeLogo = CLUBS.map(club => club.name === event.event?.homeTeam)[0]
        awayLogo = CLUBS.map(club => club.name === event.event?.awayTeam)[0]

        // console.log({homeLogo, awayLogo})

        return {
            homeLogo,
            awayLogo
        }
    }

    const giveLogo = (clubName: string) => {
        const _club = CLUBS.filter(club => club.name === clubName)[0]
        // console.log()
        const data = _club ? _club.icon : '/club/rangers-logo.png'
        return data
    }

    return (
        <Link href={`/u/tickets/${event._id}`}>
            <div
                className='border-2 border-zinc-800 hover:bg-gray-100/50 cursor-pointer duration-300 p-2 flex flex-col gap-6 px-4 rounded'>
                <section className="flex justify-between">
                    <div className="flex items-center gap-2 text-slate-500">
                        <BsFillCalendarDateFill/>
                        <h3>{new Date(event?.date).toDateString()}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <h3>{event?.time}</h3>
                        <FaClock/>
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
                               height={100}/>
                        <h2 className='text-base lg:text-xl'>{event.awayTeam}</h2>
                    </div>
                </section>

                {/*<section className='flex items-center flex-col sm:flex-row gap-2 justify-center text-center'>*/}
                {/*    <div className='text-center bg-slate-100 lg:max-w-fit w-full p-2 px-3 rounded'>*/}
                {/*        <h4 className='text-slate-400'>Popular Stands</h4>*/}
                {/*        <span className='text-2xl text-slate-600'>{event.summary["Popular Stand"]}</span>*/}
                {/*    </div>*/}
                {/*    <div className='text-center bg-slate-100 lg:max-w-fit w-full p-2 px-3 rounded'>*/}
                {/*        <h4 className='text-slate-400'>Regular Stands</h4>*/}
                {/*        <span className='text-2xl text-slate-600'>{event.summary["Cover Stand Regular"]}</span>*/}
                {/*    </div>*/}
                {/*    <div className='text-center bg-slate-100 lg:max-w-fit w-full p-2 px-3 rounded'>*/}
                {/*        <h4 className='text-slate-400'>Executive Stands</h4>*/}
                {/*        <span className='text-2xl text-slate-600'>{event.summary["Cover Stand Executive"]}</span>*/}
                {/*    </div>*/}
                {/*</section>*/}
                {event?.transformedSummary?.length > 0 ? (
                    <section className={'flex items-center flex-col sm:flex-row gap-2 justify-center text-center'}>
                        {event?.transformedSummary.map(t => {
                            console.log({t})
                            return (
                                <div className='text-center bg-zinc-700 lg:max-w-fit w-full p-2 px-3 rounded'>
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
                    <MdStadium size={32} className="text-orange-400"/>
                    <h3 className="text-lg text-orange-400">{event.venue}</h3>
                </div>
            </div>
        </Link>
    )
}

export default EventTicket