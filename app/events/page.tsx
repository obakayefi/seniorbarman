import Hero from "@/components/ui/hero";
import HowItWorks from "@/components/ui/how-it-works";
import UpcomingMatches from "@/components/ui/upcoming-matches";
import { GiSmallFire } from "react-icons/gi";
import EventHero from "@/components/ui/event-hero";
import { RiTimer2Fill } from "react-icons/ri";
import { MdLocationPin } from "react-icons/md";
import UpcomingEvents from "@/components/ui/upcoming-events";
import Image from "next/image";
import NButton from "@/components/native/NButton";
import { FaLocationPin, FaLocationPinLock } from "react-icons/fa6";
import { SlLocationPin } from "react-icons/sl";
import RegularEventCard from "@/components/ui/RegularEventCard";
import { SettingsIcon } from "lucide-react";

const FeaturedEvent = () => {
    return (
        <div className={'flex gap-2 border-2 max-w-fit border-zinc-800 overflow-hidden  rounded-lg'}>
            <Image
                src={'https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024'} alt={'event thumbnail'} height={100} width={200} />
            <section className={'p-2 text-neutral-500'}>
                <h3 className={'text-xl text-white'}>Davido Live in Enugu</h3>

                <div className="flex items-center gap-2">
                    <span><MdLocationPin /></span>
                    <span>Nnamdi Azikiwe Stadium</span>
                </div>
                <div className="flex items-center gap-2">
                    <span><RiTimer2Fill /></span>
                    <span>7:00pm</span>
                </div>

                <div className={'flex justify-between items-center border-t-2 border-zinc-900 pt-1 mt-4'}>
                    <section className={'flex flex-col '}>
                        <span className="uppercase text-neutral-400 text-xs">from</span>
                        <span className={''}>N5,000</span>
                    </section>
                    <section>
                        <NButton className={''}>Buy Tickets</NButton>
                    </section>
                </div>
            </section>
        </div>
    )
}

const RegularEvent = () => {
    return (
        <div
            className={'flex flex-col gap-2 border-2 max-w-fit border-zinc-800 overflow-hidden  rounded-lg'}>
            <Image
                src={'https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024'}
                alt={'event thumbnail'} height={100} width={300} />
            <div className="p-2 text-zinc-600 px-4">
                <section className="border-b-2 border-zinc-800 pb-2">
                    <h3 className={'text-xl text-white mb-6'}>
                        Davido Live in Enugu
                    </h3>
                    <div className="flex items-center gap-2">
                        <span><MdLocationPin /></span>
                        <span>Nnamdi Azikiwe Stadium</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span><RiTimer2Fill /></span>
                        <span>7:00pm</span>
                    </div>
                </section>

                <section className={'pt-1 flex items-center justify-between'}>
                    <span className={'text-lg text-white'}>
                        N5,000</span>

                    <div>
                        <NButton className={'bg-red-500'}>Buy Tickets</NButton>
                    </div>
                </section>
            </div>
        </div>
    )
}
export default function EventsPage() {
    return (
        <section className={'flex flex-col gap-2'}>
            {/*<FloatingNav navItems={navItems}/>*/}

            <div className="relative h-[50vh] lg:h-[55vh] overflow-x-hidden text-white">
                {/* background image */}
                <div
                    className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBL3O08Uv4lJD9b4LlzWHNboiX17N-DH3RSKOZcWwsGsx8dZ28iR4k9oLFWw9RUMtc_mlgT9bzhsnVEGU88v9Ta0ainRS0xZd9cWhWEI94Ml8gE92zowDyBwESw6r7DaCZ2HB9Jtm0VBiaSNDk20s1mSDEyzK_KmDO5QJuIBYdnEYjatBp8sBFPD_1Pj9XQfCVXH_aWS85Ox9gAs3M5PnuskZLjxEekfy-xMCQYZYrHs5ltVvo7kcxZ7BVSCy483sb-tOd9c903th8')] bg-cover h-[50vh] lg:h-full bg-center bg-no-repeat z-0" />

                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-red-600/30 z-10" />

                {/* content */}
                <div className="relative z-20 flex py-20 mx-4 lg:mx-60 md:mx-20 h-full">
                    <EventHero />
                </div>
            </div>
            <section className={'lg:pb-10 pb-4 px-2 flex flex-col lg:px-60 mt-10 '}>
                <div className="bg-zinc-950 flex flex-col 2xl:flex-row gap-6 justify-between px-6 py-10 rounded-lg">
                    <div className="flex justify-between flex-col gap-4 md:gap-0 md:flex-row w-full items-center">
                        <div className="flex justify-between gap-6">
                            <section className="flex items-center gap-2">
                                <h3 className="flex items-center gap-2"><MdLocationPin /> Enugu, Nigeria</h3>
                            </section>
                            <section className="flex items-center gap-2">
                                <h3 className="flex items-center gap-2"><MdLocationPin /> Enugu, Nigeria</h3>
                            </section>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <NButton className="bg-green-500/90 hover:bg-green-300  text-zinc-900 text-center rounded-full">ALL EVENTS</NButton>
                            <NButton className="border-2 bg-transparent text-zinc-400 border-zinc-800 text-center rounded-full">CONCERTS</NButton>
                            <NButton className="border-2 bg-transparent text-zinc-400 border-zinc-800 text-center rounded-full">PARTIES</NButton>
                        </div>
                    </div>


                    <NButton className="px-8 w-full  2xl:max-w-fit py-6 hover:bg-zinc-900">
                        <span><SettingsIcon /></span> Advanced Filters
                    </NButton>

                </div>

                <div>
                    <h3 className={'text-3xl flex items-center uppercase gap-2 px-1 py-10'}>
                        <span className="text-amber-600"><GiSmallFire /></span> Featured Events
                    </h3>

                    <div className="flex flex-col md:grid-cols-2 xl:grid-cols-3 gap-2 md:grid gap-y-6 grid-cols-3">
                        <RegularEventCard />
                        <RegularEventCard />
                        <RegularEventCard />
                        <RegularEventCard />
                        <RegularEventCard />
                        <RegularEventCard />
                    </div>
                </div>
            </section>

            {/*<HowItWorks/>*/}
            {/*<UpcomingMatches/>*/}
            {/*<UpcomingEvents/>*/}
        </section>
    )
}
