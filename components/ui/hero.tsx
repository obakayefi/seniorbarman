import {Calendar1} from "lucide-react";
import {FaLocationPinLock} from "react-icons/fa6";
import NButton from "@/components/native/NButton";

export default function Hero () {
    return (
        <header className={'flex w-full justify-between'}>
            <div className="flex gap-2 flex-col">
                <section className="bg-green-400 max-w-fit px-2 rounded mb-2">
                    <span>Official Ticketing Partner</span>
                </section>

                <section className={'flex flex-col gap-2'}>
                    <h2 className={'text-6xl font-bold'}><span className="text-green-500">Enugu Rangers</span> <br/> Home Matches</h2>
                    <div>
                        <p>Get your official match tickets for the Flying Antelopes.</p>
                        <p>Experience the thrill of Nigerian Premier Football League action at the Nnamdi Azikiwe Stadium</p>
                    </div>
                    <p className={'text-green-400 font-semibold'}>NPFL 2024/2025 Season</p>
                </section>

                <section className={'bg-black/60 px-4 rounded text-white max-w-fit justify-center flex items-center py-4'}>
                    <div className="flex items-center gap-3 border-r-1 broder-slate-100 pr-4">
                        <Calendar1 className={'text-green-500'} />
                        <section className={'flex flex-col'}>
                            <span className={'text-sm'}>Next Match</span>
                            <span className="text-lg">December 21, 2025</span>
                        </section>
                    </div>

                    <div className="flex items-center gap-3 pl-4">
                        <FaLocationPinLock className={'text-green-500'} size={30}/>
                        <section className={'flex flex-col'}>
                            <span className={'text-sm'}>Venue</span>
                            <span className="text-lg">Nnamdi Azikiwe Stadium, Enugu</span>
                        </section>
                    </div>
                </section>

                <section className={'mt-4'}>
                    {/*<div className="flex font-bold gap-2 text-xl items-center">*/}
                    {/*    <h2>Enugu Rangers</h2>*/}
                    {/*    <span>vs</span>*/}
                    {/*    <h2>Ikorodu City</h2>*/}
                    {/*</div>*/}
                    

                    <div className="flex gap-4">
                        <NButton className={'bg-green-500 px-12'}>Buy Tickets Now</NButton>
                        <NButton className={'bg-slate-700 px-12'}>View All Matches</NButton>
                    </div>
                </section>
            </div>

            <section className={'flex items-center'}>
                
                <div className={'bg-black/80 p-5'}>
                    <div className="border-b-1 border-gray-800">
                        <h2 className={'text-lg text-gray-400 uppercase'}>Next Match</h2>
                        <div className="flex font-semibold gap-3 text-xl items-center">
                            <h2>Enugu Rangers</h2>
                            <span className={'text-white h-6 w-6 text-sm rounded-full bg-black flex flex-col items-center justify-center font-normal'}>vs</span>
                            <h2>Ikorodu City</h2>
                        </div>
                    </div>
                    <div className={' gap-8 items-center rounded flex pt-3'}>
                        <section className={'flex flex-col items-center'}>
                            <span className={'text-3xl'}>03</span>
                            <span className={'text-gray-600'}>Days</span>
                        </section>
                        <div className={'h-12 bg-gray-300/10 w-0.5'}/>
                        <section className={'flex flex-col items-center'}>
                            <span className={'text-3xl'}>11</span>
                            <span className={'text-gray-600'}>Hours</span>
                        </section>
                        <div className={'h-12 bg-gray-300/10 w-0.5'}/>
                        <section className={'flex flex-col items-center'}>
                            <span className={'text-3xl'}>31</span>
                            <span className={'text-gray-600'}>Minutes</span>
                        </section>
                        <div className={'h-12 bg-gray-300/10 w-0.5'}/>
                        <section className={'flex flex-col items-center'}>
                            <span className={'text-3xl'}>31</span>
                            <span className={'text-gray-600'}>Seconds</span>
                        </section>
                    </div>
                </div>
            </section>
        </header>
    )
} 