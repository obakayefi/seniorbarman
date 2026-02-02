"use client"
import NButton from "@/components/native/NButton";
import { redirect } from "next/navigation";
import { GiSoccerBall } from "react-icons/gi";
import { HiTicket } from "react-icons/hi2";

export default function HeroAction() {

    function buyTickets() {
        alert('WTF is going on??');

        redirect('/u/events')
    }

    return (
        <div className="flex flex-col w-full lg:w-1/2 gap-4">
            <NButton onClick={buyTickets} icon={<HiTicket className={''} />} className={'bg-red-600 text-white px-12'}>Buy Tickets Now</NButton>
            {/*<NButton icon={<GiSoccerBall />} className={'bg-neutral-700 px-12'}>View All Matches</NButton>*/}
        </div>
    )
}