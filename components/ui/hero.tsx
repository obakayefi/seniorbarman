import {Calendar1} from "lucide-react";
import {FaLocationPinLock} from "react-icons/fa6";
import NButton from "@/components/native/NButton";
import {redirect} from "next/navigation";
import HeroAction from "@/components/ui/hero-action";

export default function Hero () {
    return (
        <header className={'flex flex-col xl:flex-row w-full justify-between'}>
            <div className="flex gap-2 flex-col">
                <section className="bg-red-600 max-w-fit px-2 rounded mb-2">
                    <span>Official Ticketing Partner</span>
                </section>

                <section className={'flex flex-col gap-2'}>
                    <h2 className={'text-3xl font-semibold lg:text-6xl lg:font-bold'}><span className="text-red-600">Enugu Rangers</span> <br/> Home Matches</h2>
                    <div className={'flex text-sm flex-col gap-1'}>
                        <p>Get your official match tickets for the Flying Antelopes.</p>
                        <p>Experience the thrill of Nigerian Premier Football League action at the Nnamdi Azikiwe Stadium</p>
                    </div>
                    <p className={'text-red-600 font-semibold'}>NPFL 2024/2025 Season</p>
                </section>

                <section className={'bg-black/60 px-4 rounded text-white w-full lg:max-w-fit justify-start flex flex-col gap-4 items-center py-4'}>
                    <div className="flex items-center gap-3 lg:border-r-1 border-b-1 w-full border-slate-800 lg:pr-4">
                        <Calendar1 className={'text-red-600'} />
                        <section className={'flex flex-col'}>
                            <span className={'text-sm'}>Next Match</span>
                            <span className="text-lg">December 21, 2025</span>
                        </section>

                        {/*<section className={'flex flex-col'}>*/}
                        {/*    <span className={'text-sm'}>Next Match</span>*/}
                        {/*    <span className="text-lg">December 21, 2025</span>*/}
                        {/*</section>  */}
                    </div>

                    <div className="flex items-center w-full gap-3 lg:pl-2">
                        <FaLocationPinLock className={'text-red-600'} size={24}/>
                        <section className={'flex flex-col'}>
                            <span className={'text-sm'}>Venue</span>
                            <span className="text-lg">Nnamdi Azikiwe Stadium, Enugu</span>
                        </section>
                    </div>
                </section>

                <section className={'mt-4'}>
                    <HeroAction />
                </section>
            </div>

            <section className={'flex mx-auto lg:mx-0 border-slate-950 rounded z-20 items-center mt-11'}>
                
                <div className={'bg-black/80 z-50 p-5'}>
                    <div className="border-b-1 border-gray-800">
                        <h2 className={'text-sm  lg:text-lg text-gray-400 uppercase'}>Next Match</h2>
                        <div className="flex font-semibold gap-3 text-lg lg:text-xl items-center justify-between">
                            <h2>Enugu Rangers</h2>
                            <span className={'text-white h-6 w-6 text-sm rounded-full bg-red-600 flex flex-col items-center justify-center font-normal'}>vs</span>
                            <h2>Ikorodu City</h2>
                        </div>
                    </div>
                    <div className={' gap-8 items-center rounded flex pt-3'}>
                        <section className={'flex flex-col items-center'}>
                            <span className={'text-xl lg:text-3xl'}>03</span>
                            <span className={'text-gray-600 text-xs'}>Days</span>
                        </section>
                        <div className={'h-12 bg-gray-300/10 w-0.5'}/>
                        <section className={'flex flex-col items-center'}>
                            <span className={'text-xl lg:text-3xl'}>11</span>
                            <span className={'text-gray-600 text-xs'}>Hours</span>
                        </section>
                        <div className={'h-12 bg-gray-300/10 w-0.5'}/>
                        <section className={'flex flex-col items-center'}>
                            <span className={'text-xl lg:text-3xl'}>31</span>
                            <span className={'text-gray-600 text-xs'}>Minutes</span>
                        </section>
                        <div className={'h-12 bg-gray-300/10 w-0.5'}/>
                        <section className={'flex flex-col items-center'}>
                            <span className={'text-xl lg:text-3xl'}>31</span>
                            <span className={'text-gray-600 text-xs'}>Seconds</span>
                        </section>
                    </div>
                </div>
            </section>
        </header>
    )
} 