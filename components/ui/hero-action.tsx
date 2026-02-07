"use client"
import NButton from "@/components/native/NButton";
import { GiSoccerBall } from "react-icons/gi";
import { HiTicket } from "react-icons/hi2";

import { Dialog, DialogTrigger } from "./dialog";
import { BookEventModal } from "../modals/book-event";

export default function HeroAction({ eventId }: { eventId: string }) {

    return (
        <div className="flex flex-col w-full lg:w-1/2 gap-4">
            <Dialog>
                <DialogTrigger asChild>
                    <NButton icon={<HiTicket className={''} />} className={'bg-red-600 text-white px-12'}>Buy Tickets Now</NButton>
                </DialogTrigger>
                <BookEventModal eventId={eventId} />
            </Dialog>
            {/*<NButton icon={<GiSoccerBall />} className={'bg-neutral-700 px-12'}>View All Matches</NButton>*/}
        </div>
    )
}