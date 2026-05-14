import { SiCalendly } from "react-icons/si";
import NButton from "../native/NButton";
import { SlLocationPin } from "react-icons/sl";
import { Calendar1, ClipboardList } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { BookRegularEventModal } from "../modals/book-regular-event";
import { DeleteConfirmModal } from "../modals/delete-confirm-modal";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HunchoRoleChecker } from "@/lib/helpers";

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

    const isAdmin = HunchoRoleChecker(user?.role)

    const [isDeleting, setIsDeleting] = useState(false)

    const onDelete = async () => {
        if (!confirm("Removing this event will nullify all associated tickets. Do you also want to permanently delete its associated tickets as well?")) {
            // If they don't even want to delete the event, we stop. 
            // But wait, the prompt above is "Delete event + tickets?". 
            // Better UX: "Are you sure you want to delete this event?" -> "Do you also want to delete all tickets?"
            return;
        }

        const deleteTickets = confirm("Do you also want to delete all tickets associated with this event? (Recommended to avoid orphaned tickets)");

        setIsDeleting(true)
        try {
            if (deleteTickets) {
                await api.delete(`/tickets?eventId=${event._id}`);
            }
            const res = await api.delete(`/events/${event._id}?type=event`)
            if (res.status === 200) {
                toast.success("Event and associated tickets deleted")
                window.location.reload()
            }
        } catch (error) {
            toast.error("Failed to delete event")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <section className="min-w-76 w-full rounded-xl border-[1.5px] border-zinc-900 overflow-hidden group transition-shadow duration-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)] hover:border-zinc-800 flex flex-col h-full">
            <Link href={`/events/${event._id}`} className="block bg-zinc-800 overflow-hidden shrink-0">
                <img src={event.image || "https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024"} alt="" className='w-full h-62 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110' />
            </Link>
            <div className="p-2 py-6 flex flex-col gap-8 text-zinc-100 bg-zinc-950 px-6 flex-1 justify-between">
                <section className="flex gap-2 flex-col">
                    <section className="flex flex-col gap-2">
                        <Link href={`/events/${event._id}`} className="hover:text-amber-500 transition-colors">
                            <h2 className="text-xl">{event.title}</h2>
                        </Link>
                        <p className="text-sm flex gap-2 text-zinc-600"><span><Calendar1 size={16} /></span>{formattedDate}</p>
                        <p className="flex items-center gap-2 text-sm text-zinc-600"><span><SlLocationPin /></span> {event.venue}</p>
                        {event.requiresApplication && (
                            <div className="flex w-fit items-center gap-1.5 px-2 py-1 mt-1 bg-blue-500/10 rounded-md text-blue-500 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                                <ClipboardList size={12} />
                                Application Required
                            </div>
                        )}
                    </section>
                </section>
                <section className="flex w-full items-end justify-between">
                    <div className="flex flex-col gap-1">
                        {event.ticketTypes?.slice(0, 2).map((ticket: any, index: number) => (
                            <div key={index}>
                                <span className="text-xs text-zinc-600 uppercase">{ticket.name}</span>
                                <p className={`text-xl font-semibold ${index === 0 ? 'text-green-400' : 'text-yellow-500'}`}>
                                    {Number(ticket.price || 0) <= 0 ? "FREE" : (
                                        <>
                                            ₦ <span className="text-white">{Number(ticket.price).toLocaleString()}</span>
                                        </>
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2">
                        {isAdmin && (
                            <div className="flex flex-col gap-1 w-full text-right items-end">
                                <NButton
                                    onClick={() => router.push(`/u/a/events/${event._id}/edit`)}
                                    className="bg-zinc-800 border border-zinc-700 w-full text-xs py-1"
                                >
                                    EDIT EVENT
                                </NButton>
                                <DeleteConfirmModal
                                    onConfirm={onDelete}
                                    isDeleting={isDeleting}
                                    trigger={
                                        <NButton
                                            className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 w-full text-xs py-1"
                                        >
                                            DELETE EVENT
                                        </NButton>
                                    }
                                />
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