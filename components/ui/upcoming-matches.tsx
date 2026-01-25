import NButton from "@/components/native/NButton";
import { Calendar1Icon, Clock, MapPin, Timer } from "lucide-react";
import { FaLocationPin } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { getEvents } from "@/app/u/events/page";
import { formattedDate } from "@/lib/utils";
import { redirect } from "next/navigation";

function FootballMatch({ isNextMatch, match }: { isNextMatch?: boolean, match: {} }) {
    return (
        <div
            className={`${isNextMatch ? "border-green-400 pt-4" : "border-zinc-900"} border-2 relative flex flex-col bg-zinc-950 items-start justify-start gap-3 px-6 py-2 rounded-lg`}>
            {isNextMatch ? (
                <div className="absolute -top-3 left-[40%] lg:-left-1">
                    <span className={'bg-green-500 px-2 py-1  text-white text-xs mt-5 rounded'}>Next Match</span>
                </div>
            ) : null}
            <div className={'flex flex-row justify-between w-full gap-2'}>
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
                                className={'flex min-w-fit text-xs flex-col items-center lg:items-start justify-center lg:justify-start text-gray-400 gap-4'}>
                                <p className={'flex gap-1'}><Calendar1Icon size={14} />
                                    <span>{new Date(match.date).toDateString()}</span></p>
                                <p className={'flex gap-1'}><Clock size={14} /> 4:00pm</p>
                                <p className={'flex gap-1'}><MapPin size={14} /> Nnamdi Azikiwe Stadium, Enugu</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={'text-sm flex flex-col max-w-fit lg:flex-col text-right w-full justify-center lg:justify-end lg:items-end items-center gap-1 lg:text-right'}>
                        <p className={'text-slate-500 hidden lg:flex'}>From</p>
                        <h4 className={'text-2xl text-green-500 font-bold'}>₦500</h4>
                        <p className={'text-slate-500'}>30,000 tickets left</p>
                        <div className={'w-full flex items-center justify-center pt-5'}>
                            <NButton className={'bg-green-500 w-full'} onClick={() => redirect('/u/events')}>Buy Tickets</NButton>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default function UpcomingMatches({ upcomingMatches }: { upcomingMatches: [] }) {

    return (
        <section className={'px-2 xl:px-60 mb-20'} id={'upcomingMatches'}>
            <div>
                <h2 className={'text-xl lg:text-3xl'}>Upcoming Home Matches</h2>
                <span className={'text-gray-400 text-xs'}>Secure your tickets for Enugu Rangers FC home games</span>
            </div>

            <section className={'flex flex-col md:grid md:grid-cols-2 gap-4 mt-10'}>
                {upcomingMatches.length ? upcomingMatches.map((match, index) => (
                    <FootballMatch match={match} isNextMatch={index === 0} />
                )) : <div><h3 className={'text-zinc-600'}>Loading upcoming matches</h3></div>}
            </section>
        </section>
    )
}