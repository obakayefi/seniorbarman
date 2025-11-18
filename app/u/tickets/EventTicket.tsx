

import { MdStadium } from "react-icons/md"
import { BsFillCalendarDateFill } from "react-icons/bs";
import { FaClock } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { CLUBS } from "@/lib/utils";

type EventProps = {
    summary: {}
    id: string,
    time: string,
    date: Date
}

const EventTicket = ({ event }: { event: EventProps }) => {
    console.log({ event })

    const teamLogos = () => {
        let homeLogo, awayLogo;

        homeLogo = CLUBS.map(club => club.name === event.event?.homeTeam)[0]
        awayLogo = CLUBS.map(club => club.name === event.event?.awayTeam)[0]

        console.log({homeLogo, awayLogo})

        return {
            homeLogo,
            awayLogo
        }
    }

    const giveLogo = (clubName: string) => {
        const _club = CLUBS.filter(club => club.name === clubName)[0]
        // console.log()
        const data =_club ? _club.icon : '/club/rangers-logo.png'
        return data
    }

    return (
        <Link href={`/u/tickets/${event.id}`}>
            <div className='border-2 border-gray-100 hover:bg-gray-100/50 cursor-pointer duration-300 p-2 flex flex-col gap-6 px-4 rounded'>
                <section className="flex justify-between">
                    <div className="flex items-center gap-2 text-slate-500">
                        <BsFillCalendarDateFill />
                        <h3>{new Date(event.event.date).toDateString()}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <h3>{event.event.time}</h3>
                        <FaClock />
                    </div>

                </section>

                <section className='flex items-center justify-center gap-1'>
                    <div className="flex flex-col items-center">
                        <Image src={giveLogo(event.event.homeTeam)} width={75} alt="logo" height={100} />
                        <h2 className='text-xl'>{event.event.homeTeam}</h2>
                    </div>
                    <span className='text-slate-400 mx-4'>vs</span>
                    <div className="flex flex-col items-center">
                        <Image src={giveLogo(event.event.awayTeam)} width={75} alt="logo" height={100} />
                        <h2 className='text-xl'>{event.event.awayTeam}</h2>
                    </div>
                </section>

                <section className='flex items-center gap-2 justify-center text-center'>
                    <div className='text-center bg-slate-100 p-2 px-3 rounded'>
                        <h4 className='text-slate-400'>Popular Stands</h4>
                        <span className='text-2xl text-slate-600'>{event.summary["Popular Stand"]}</span>
                    </div>
                    <div className='text-center bg-slate-100 p-2 px-3 rounded'>
                        <h4 className='text-slate-400'>Regular Stands</h4>
                        <span className='text-2xl text-slate-600'>{event.summary["Cover Stand Regular"]}</span>
                    </div>
                    <div className='text-center bg-slate-100 p-2 px-3 rounded'>
                        <h4 className='text-slate-400'>Executive Stands</h4>
                        <span className='text-2xl text-slate-600'>{event.summary["Cover Stand Executive"]}</span>
                    </div>
                </section>

                <div className="text-center flex flex-col items-center justify-center">
                    <MdStadium size={32} className="text-orange-400" />
                    <h3 className="text-lg text-orange-400">{event.event.venue}</h3>
                </div>
            </div>
        </Link>
    )
}

export default EventTicket