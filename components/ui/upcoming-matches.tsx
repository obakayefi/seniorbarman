"use client"
import NButton from "@/components/native/NButton";
import {Calendar1Icon, Clock, MapPin, Timer} from "lucide-react";
import {FaLocationPin} from "react-icons/fa6";
import {useEffect, useState} from "react";
import {getEvents} from "@/app/u/events/page";
import {formattedDate} from "@/lib/utils";
import {redirect} from "next/navigation";

function FootballMatch({isNextMatch, match}: { isNextMatch?: boolean, match: {} }) {


    console.log({match})


    return (
        <div
            className={`${isNextMatch ? "border-green-400" : "border-slate-900"} border-2 flex lg:flex-row flex-col justify-between items-start gap-3 px-6 py-2 rounded-lg`}>
            {isNextMatch ? (
                <div className="min-w-fit flex max-w-fit lg:px-4 lg:items-center justify-center mx-auto lg:flex-start">
                    <span className={'bg-green-500 px-2  text-white text-xs mt-5 rounded'}>Next Match</span>
                </div>
            ) : null}
            <div
                className={'flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-2  text justify-between  w-full'}>
                <div className={'w-full '}>
                    <div className={'flex text-slate-200  w-full flex-col gap-1 justify-between'}>
                        <div
                            className={'flex flex-col md:flex-row gap-2 items-center lg:items-start lg:justify-start justify-center text-center'}>
                            <h2>{match.homeTeam}</h2>
                            <span className={'text-gray-400'}>vs</span>
                            <h2>{match.awayTeam}</h2>
                        </div>

                        <div
                            className={'flex min-w-fit text-xs flex-col lg:flex-row  items-center lg:items-start justify-center lg:justify-start text-gray-400 gap-4'}>
                            <p className={'flex gap-1'}><Calendar1Icon size={14}/> <span>{new Date(match.date).toDateString()}</span></p>
                            <p className={'flex gap-1'}><Clock size={14}/> 4:00pm</p>
                            <p className={'flex gap-1'}><MapPin size={14}/> Nnamdi Azikiwe Stadium, Enugu</p>
                        </div>
                    </div>
                </div>

                <div
                    className={'text-sm flex flex-col max-w-fit lg:flex-col text-right w-full justify-center lg:justify-end lg:items-end items-center gap-1 lg:text-right'}>
                    <p className={'text-slate-500 hidden lg:flex'}>From</p>
                    <h4 className={'text-2xl text-green-500 font-bold'}>₦500</h4>
                    <p className={'text-slate-500'}>30,000 tickets left</p>
                </div>

            </div>
            <div className={'w-full flex items-center justify-center pt-5 lg:w-1/4'}>
                <NButton className={'bg-green-500 w-full'} onClick={() => redirect('/u/events')}>Buy Tickets</NButton>
            </div>
        </div>
    )
}

export default function UpcomingMatches() {
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    
    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true)
            const _events = await getEvents()
            //console.log("Fetching events", {events: _events})
            console.log({_events})  
            const stats = {
                upcoming: _events.upcomingEvents,
                total: _events.totalEvents,
            }
            setData(_events.events.reverse())
            // setEventStats(stats)
            setIsLoading(false)
        }
        fetchEvents()
    }, [])
    return (
        <section className={'px-2 xl:px-60 mb-20'} id={'upcomingMatches'}>
            <div>
                <h2 className={'text-xl lg:text-3xl'}>Upcoming Home Matches</h2>
                <span className={'text-gray-400 text-xs'}>Secure your tickets for Enugu Rangers FC home games</span>
            </div>

            <section className={'flex flex-col md:grid grid-cols-2 lg:flex gap-4 mt-10'}>
                {data.map((match, index) => (
                    <FootballMatch match={match} isNextMatch={index === 0}/>
                ))}
            </section>
        </section>
    )
}