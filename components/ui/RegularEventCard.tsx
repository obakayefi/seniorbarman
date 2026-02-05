import { SiCalendly } from "react-icons/si";
import NButton from "../native/NButton";
import { SlLocationPin } from "react-icons/sl";
import { Calendar1 } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { BookRegularEventModal } from "../modals/book-regular-event";

export default function RegularEventCard({ event }: { event: any }) {
    console.log({ regularPrice: event })
    return (
        <section className="min-w-76 w-full rounded-xl border-[1.5px] border-zinc-900 overflow-hidden group transition-shadow duration-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)] hover:border-zinc-800">
            <div className="bg-zinc-800 overflow-hidden">
                <img src={event.image || "https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024"} alt="" className='w-full h-62 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110' />
            </div>
            <div className="p-2 py-6 flex flex-col gap-8 text-zinc-100 bg-zinc-950 px-6">
                <section className="flex gap-2 flex-col">
                    <section className="flex flex-col gap-2">
                        <h2 className="text-xl">{event.title}</h2>
                        <p className="text-sm flex gap-2 text-zinc-600"><span><Calendar1 size={16} /></span>{new Date(event.date).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        <p className="flex items-center gap-2 text-sm text-zinc-600"><span><SlLocationPin /></span> {event.venue}</p>
                    </section>
                </section>
                <section className="flex w-full items-end justify-between">
                    <div className="flex flex-col gap-1">
                        <div>
                            <span className="text-xs text-zinc-600">REGULAR</span>
                            <p className="text-xl text-green-400 font-semibold">₦ <span className="text-white">{Number(event.regularPrice || 0).toLocaleString()}</span></p>
                        </div>
                        <div>
                            <span className="text-xs text-zinc-600">VIP</span>
                            <p className="text-xl text-yellow-500 font-semibold">₦ <span className="text-white">{Number(event.vipPrice || 0).toLocaleString()}</span></p>
                        </div>
                    </div>
                    <div className="">
                        <Dialog>
                            <DialogTrigger asChild className="">
                                <NButton className="bg-green-800">BUY TICKETS</NButton>
                            </DialogTrigger>

                            <BookRegularEventModal event={event} />
                        </Dialog>
                    </div>
                </section>
            </div>
        </section>
    )
}