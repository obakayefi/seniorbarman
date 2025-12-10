"use client"
import NButton from "@/components/native/NButton";
import {redirect} from "next/navigation";
import { GiSoccerBall } from "react-icons/gi";
import { HiTicket } from "react-icons/hi2";


export default function () {
    return (
        <div className="flex flex-col w-full lg:w-1/2 gap-4">
            <NButton icon={<HiTicket className={''}/>} className={'bg-green-500 text-white px-12'}>Buy Tickets Now</NButton>
            <NButton icon={<GiSoccerBall />} className={'bg-neutral-700 px-12'}>View All Matches</NButton>
        </div>
    )
}