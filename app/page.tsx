import About from "@/components/About";
import BusinessCard, {IBusiness} from "@/components/widgets/BusinessCard";
import {Calendar1, MoveRight, User} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {FaLocationPin, FaLocationPinLock} from "react-icons/fa6";
import {BiLocationPlus} from "react-icons/bi";
import NButton from "@/components/native/NButton";
import Hero from "@/components/ui/hero";
import HowItWorks from "@/components/ui/how-it-works";
import {MdCelebration} from "react-icons/md";
import {GiSoccerBall} from "react-icons/gi";
import {IconHome, IconMessage, IconUser} from "@tabler/icons-react";
import {FloatingNav} from "@/components/ui/floating-navbar";
import UpcomingMatches from "@/components/ui/upcoming-matches";
import UpcomingEvents from "@/components/ui/upcoming-events";

export default function Home() {
    // const navItems = [
    //     {
    //         name: "Home",
    //         link: "/",
    //         icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white"/>,
    //     },
    //     {
    //         name: "About",
    //         link: "/about",
    //         icon: <IconUser className="h-4 w-4 text-neutral-500 dark:text-white"/>,
    //     },
    //     {
    //         name: "Contact",
    //         link: "/contact",
    //         icon: (
    //             <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white"/>
    //         ),
    //     },
    // ];

    return (
        <section className={'h-full lg:h-screen flex flex-col items-center justify-center gap-10 py-10'}>
            <div className="flex flex-col items-center px-4">
                <h3 className={'text-3xl'}>Buy Tickets for the Moments You Show Up For</h3>
                <p className={'text-zinc-500'}>Home matches. Concerts. Parties. One trusted place to get in.</p>
            </div>

            {/* Action Cards Split View */}
            <div className="flex flex-col px-6 lg:grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">

                {/* Sports Card */}
                <div
                    className="group 
                    relative overflow-hidden rounded-xl h-[400px] md:h-[500px] shadow-2xl shadow-black/50 cursor-pointer transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1">

                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        data-alt="Enugu Rangers football stadium during a match with green grass"
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDuWVW9t9DqpEWhE2E31YB0RnoiyEXs-jWjewMPtQ-qsXOuDY7Qc5h8W0r8eoMNoEALKZj4sfa1S1MzeV6W-E-vYH7pTG_OMH3ZGDC9TNOHo3himD7ujgiCuadh5e2vqevSHJ4fVy3sPDe9eJIHYiIgP0BYJTjc0RdRaNyjHGbnbLJoWHXJSFbUQvS0bW-NFvneQNMTvNA-jxqoXTtAghPY_bPJ_jUnDyCzB6fUV1zEiE8B5HmKyqaf7eS9y3SQGI29UfnC_dkodCc")',
                        }}
                    />

                    {/* Gradient Overlay */}
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent opacity-90"/>

                    {/* Content */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-end items-start">
                        <div className="mb-auto">
        <span
            className="inline-flex items-center gap-1 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-bold text-primary border border-primary/20">
          <span className="material-symbols-outlined text-sm"><GiSoccerBall/></span>
          Sports
        </span>
                        </div>

                        <h3 className="text-white text-2xl font-bold leading-tight mb-2">
                          <span className="text-3xl text-green-500">Enugu Rangers</span><br/>Home Matches
                        </h3>

                        <p className="text-gray-300 text-sm mb-6 line-clamp-2">
                            Experience the thrill of the Flying Antelopes live at Nnamdi Azikiwe Stadium.
                        </p>

                        <Link href={'/rangers'}>
                            <button
                                className="w-full md:w-auto flex items-center justify-center gap-2 rounded-full h-12 px-8 bg-primary text-background-dark text-base font-bold transition-transform hover:bg-red-500 cursor-pointer active:scale-95">
                                <span>Get Rangers Tickets</span>
                                <span className="material-symbols-outlined text-lg"><MoveRight/></span>
                            </button>
                            
                        </Link>
                    </div>
                </div>

                {/* Events Card */}
                <div
                    className="group relative overflow-hidden rounded-xl h-[400px] md:h-[500px] shadow-2xl shadow-black/50 cursor-not-allowed transition-all duration-300 hover:shadow-purple-500/20 hover:-translate-y-1">

                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        data-alt="Exciting concert crowd with stage lights and energetic atmosphere"
                        style={{
                            backgroundImage:
                                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA3QkG6n5mz6Qtb2RkXK8bLZR4hnUP43ybLbME0im-BRwJTHvc05-Im2yMpsu3OiYP_0JAsgEJJPBiJVJ3HPtR-8jea-_Ob_TeVFnawUgMJ1TqacJFHN7xkDKixX-vc8nADw0-9NiVs4csDia2271glzRjhbgC_bWUQND9C6taJD0rpNq0_o1gbB3ixM30daBkn-xpwVFQkw5Sp_YTR5gKFutoa9n1eIZr38uIZkqyLg5Z5j8ivW2GvcybIFFXaMFxi-Fj0TbQvM7k")',
                        }}
                    />

                    {/* Gradient Overlay */}
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent opacity-90"/>

                    {/* Content */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-end items-start">
                        <div className="mb-auto">
                        <span
                            className="inline-flex items-center gap-1 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white border border-white/20">
                          <span className="material-symbols-outlined text-sm"><MdCelebration/></span>
                          Coming Soon
                        </span>
                        </div>

                        <h3 className="text-white text-3xl font-bold leading-tight mb-2">
                            Concerts &amp;<br/>Parties
                        </h3>

                        <p className="text-gray-300 text-sm mb-6 line-clamp-2">
                            From Afrobeats concerts to exclusive nightlife events across the city.
                        </p>
                        
                            <button
                                className="w-full md:w-auto flex items-center justify-center gap-2 rounded-full h-12 px-8 bg-surface-dark text-white border border-white/10 hover:bg-zinc-900 cursor-not-allowed hover:text-background-dark text-base font-bold transition-colors active:scale-95">
                                <span>Browse Events</span>
                                <span className="material-symbols-outlined text-lg"><MoveRight/></span>
                            </button>
 
                    </div>
                </div>
            </div>

        </section>
    );
}
