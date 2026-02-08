import { SiCalendly } from "react-icons/si";
import NButton from "../native/NButton";
import { SlLocationPin } from "react-icons/sl";
import { Calendar1 } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { BookRegularEventModal } from "../modals/book-regular-event";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useEffect, useState } from "react";

export default function RegularEventCard({ event }: { event: any }) {
    const { user } = useApp()
    const router = useRouter()
    const [formattedDate, setFormattedDate] = useState("")

    useEffect(() => {
        if (event.date) {
            setFormattedDate(new Date(event.date).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }))
        }
    }, [event.date])

    const isAdmin = user?.role === 'admin'

    const onDelete = async () => {
        if (!confirm("Are you sure you want to delete this event?")) return
        try {
            const res = await api.delete(`/events/${event._id}`)
            if (res.status === 200) {
                toast.success("Event deleted")
                window.location.reload()
            }
        } catch (error) {
            toast.error("Failed to delete event")
        }
    }

    return (
        <section className="min-w-76 w-full rounded-xl border-[1.5px] border-zinc-900 overflow-hidden group transition-shadow duration-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)] hover:border-zinc-800">
            <div className="bg-zinc-800 overflow-hidden">
                <img src={event.image || "https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024"} alt="" className='w-full h-62 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110' />
            </div>
            <div className="p-2 py-6 flex flex-col gap-8 text-zinc-100 bg-zinc-950 px-6">
                <section className="flex gap-2 flex-col">
                    <section className="flex flex-col gap-2">
                        <h2 className="text-xl">{event.title}</h2>
                        <p className="text-sm flex gap-2 text-zinc-600"><span><Calendar1 size={16} /></span>{formattedDate}</p>
                        <p className="flex items-center gap-2 text-sm text-zinc-600"><span><SlLocationPin /></span> {event.venue}</p>
                    </section>
                </section>
                <section className="flex w-full items-end justify-between">
                    <div className="flex flex-col gap-1">
                        <div>
                            <span className="text-xs text-zinc-600">REGULAR</span>
                            <p className="text-xl text-green-400 font-semibold">
                                {Number(event.regularPrice || 0) <= 0 ? "FREE" : (
                                    <>
                                        ₦ <span className="text-white">{Number(event.regularPrice).toLocaleString()}</span>
                                    </>
                                )}
                            </p>
                        </div>
                        <div>
                            <span className="text-xs text-zinc-600">VIP</span>
                            <p className="text-xl text-yellow-500 font-semibold">
                                {Number(event.vipPrice || 0) <= 0 ? "FREE" : (
                                    <>
                                        ₦ <span className="text-white">{Number(event.vipPrice).toLocaleString()}</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        {/* Admin Actions */}
                        {isAdmin && (
                            <div className="flex flex-col gap-1">
                                <NButton
                                    onClick={() => router.push(`/u/a/events/${event._id}/edit`)}
                                    className="bg-zinc-800 border border-zinc-700 w-full text-xs py-1"
                                >
                                    EDIT EVENT
                                </NButton>
                                <NButton
                                    onClick={onDelete}
                                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 w-full text-xs py-1"
                                >
                                    DELETE EVENT
                                </NButton>
                            </div>
                        )}
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