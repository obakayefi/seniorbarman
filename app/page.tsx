import About from "@/components/About";
import BusinessCard, {IBusiness} from "@/components/widgets/BusinessCard";
import {Calendar1, User} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {FaLocationPin, FaLocationPinLock} from "react-icons/fa6";
import {BiLocationPlus} from "react-icons/bi";
import NButton from "@/components/native/NButton";
import Hero from "@/components/ui/hero";
import HowItWorks from "@/components/ui/how-it-works";
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
        <section className={''}>
            {/*<FloatingNav navItems={navItems}/>*/}

            <div className="relative h-[90vh] lg:h-[70vh] overflow-x-hidden text-white">
                {/* background image */}
                <div className="absolute inset-0 bg-[url('/header-bg.png')] bg-cover h-[90vh] lg:h-[70vh] bg-center bg-no-repeat z-0"/>

                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-green-500/50 z-10"/>

                {/* content */}
                <div className="relative z-20 flex py-20 mx-4 lg:mx-60 h-full">
                    <Hero/>
                </div>
            </div>
            <HowItWorks/>
            <UpcomingMatches/>
            <UpcomingEvents/>
        </section>
    );
}
