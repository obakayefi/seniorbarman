import NButton from "@/components/native/NButton";
import {Calendar1Icon, Clock, MapPin, Timer} from "lucide-react";
import {FaLocationPin} from "react-icons/fa6";

function FootballMatch({isNextMatch}: {isNextMatch?: boolean}) {
    
    return (
        <div className={`${isNextMatch ? "border-green-400" : "border-slate-900"} border-2 flex lg:flex-row flex-col justify-between items-start gap-3 px-6 py-2 rounded-lg`}>
            {isNextMatch ? (
                <div className="min-w-fit flex max-w-fit lg:px-4 lg:items-center justify-center lg:flex-start">
                    <span className={'bg-green-500 px-2  text-white text-xs mt-5 rounded'}>Next Match</span>
                </div>
            ): null}
            <div className={'flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-2  text justify-between  w-full'}>
                <div className={'w-full '}>
                    <div className={'flex text-slate-200  w-full flex-col gap-1 justify-between'}>
                        <div className={'flex gap-2 items-center lg:items-start lg:justify-start justify-center text-center'}>
                            <h2>Enugu Rangers</h2>
                            <span className={'text-gray-400'}>vs</span>
                            <h2>Ikorodu City</h2>
                        </div>

                        <div className={'flex min-w-fit text-xs flex-col lg:flex-row  items-center lg:items-start justify-center lg:justify-start text-gray-400 gap-4'}>
                            <p className={'flex gap-1'}><Calendar1Icon size={14}/> <span>Sat, Dec 21, 2025</span></p>
                            <p className={'flex gap-1'}><Clock size={14}/> 4:00pm</p>
                            <p className={'flex gap-1'}><MapPin size={14}/> Nnamdi Azikiwe Stadium, Enugu</p>
                        </div>
                    </div>
                </div>

                <div className={'text-sm flex flex-row lg:flex-col text-right w-full justify-center lg:justify-end lg:items-end items-center gap-1 lg:text-right'}>
                    <p className={'text-slate-500 hidden lg:flex'}>From</p>
                    <h4 className={'text-2xl text-green-500 font-bold'}>₦500</h4>
                    <p className={'text-slate-500'}>16,000 tickets left</p>
                </div>

            </div>
            <div className={'w-full flex items-center justify-center pt-5 lg:w-1/4'}>
                <NButton className={'bg-green-500 w-full'}>Buy Tickets</NButton>
            </div>
        </div>
    )
}

export default function UpcomingMatches() {
    return (
        <section className={'px-2 xl:px-60'} id={'upcomingMatches'}>
            <div>
                <h2 className={'text-xl lg:text-3xl'}>Upcoming Home Matches</h2>
                <span className={'text-gray-400 text-xs'}>Secure your tickets for Enugu Rangers FC home games</span>
            </div>

            <section className={'flex flex-col gap-4 mt-10'}>
                {/*MATCH ROW*/}
                <FootballMatch isNextMatch/> 
                <FootballMatch /> 
                <FootballMatch /> 
            </section>
        </section>
    )
}