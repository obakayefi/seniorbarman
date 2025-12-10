import NButton from "@/components/native/NButton";
import {Calendar1Icon, Clock, MapPin, Timer} from "lucide-react";
import {FaLocationPin} from "react-icons/fa6";

function FootballMatch({isNextMatch}: {isNextMatch?: boolean}) {
    
    return (
        <div className={`${isNextMatch ? "border-green-400" : "border-slate-900"} border-2  flex justify-between items-center gap-3 px-6 py-2 rounded-lg`}>
            {isNextMatch ? (
                <div className="min-w-fit flex flex-start">
                    <span className={'bg-green-500 px-2  text-white text-xs rounded'}>Next Match</span>
                </div>
            ): null}
            <div className={'flex items-center justify-between grow-0 w-full'}>
                <div>
                    <div className={'flex text-slate-200 flex-col gap-1 justify-between'}>
                        <div className={'flex gap-2'}>
                            <h2>Enugu Rangers</h2>
                            <span className={'text-gray-400'}>vs</span>
                            <h2>Ikorodu City</h2>
                        </div>

                        <div className={'flex text-xs text-gray-400 gap-4'}>
                            <p className={'flex gap-1'}><Calendar1Icon size={14}/> <span>Sat, Dec 21, 2025</span></p>
                            <p className={'flex gap-1'}><Clock size={14}/> 4:00pm</p>
                            <p className={'flex gap-1'}><MapPin size={14}/> Nnamdi Azikiwe Stadium, Enugu</p>
                        </div>
                    </div>
                </div>

                <div className={'text-sm text-right'}>
                    <p className={'text-slate-500'}>From</p>
                    <h4 className={'text-2xl text-green-500 font-bold'}>₦500</h4>
                    <p className={'text-slate-500'}>16,000 tickets left</p>
                </div>

            </div>
            <div>
                <NButton className={'bg-green-500'}>Buy Tickets</NButton>
            </div>
        </div>
    )
}

export default function UpcomingMatches() {
    return (
        <section className={'px-60'} id={'upcomingMatches'}>
            <div>
                <h2 className={'text-3xl'}>Upcoming Home Matches</h2>
                <span className={'text-gray-400'}>Secure your tickets for Enugu Rangers FC home games</span>
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