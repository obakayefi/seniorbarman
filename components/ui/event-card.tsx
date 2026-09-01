"use client"
import { AlarmClock, MapPin, ClipboardList } from 'lucide-react';
import Image from 'next/image';
import { Button } from './button';
import { EventType, IEvent } from '@/types/components';
import { Dialog, DialogTrigger } from './dialog';
import { BookEventModal } from '../modals/book-event';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CLUBS, formatEvent } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { HunchoRoleChecker } from '@/lib/helpers';

export const EventCard = ({ event }: { event: EventType }) => {
    const { user } = useApp()
    const router = useRouter()
    const [matchInformation, setMatchInformation] = useState<EventType>({} as EventType)

    const isAdmin = HunchoRoleChecker(user?.role)

    const onDelete = async () => {
        if (!confirm("Removing this match will nullify all associated tickets. Do you also want to permanently delete its associated tickets as well?")) return

        const deleteTickets = confirm("Do you also want to delete all tickets associated with this match? (Recommended to avoid orphaned tickets)");

        try {
            if (deleteTickets) {
                await api.delete(`/tickets?eventId=${event._id}`);
            }
            const res = await api.delete(`/events/${event._id}`)
            if (res.status === 200) {
                toast.success("Match and associated tickets deleted")
                window.location.reload()
            }
        } catch (e) {
            toast.error("Failed to delete")
        }
    }

    useEffect(() => {
        const _event = formatEvent(event) as EventType
        setMatchInformation(_event)
    }, [event])

    return (
        <section
            className='flex flex-col w-full items-center duration-200 bg-card hover:bg-muted/40 border border-border gap-3 justify-center rounded-sm p-4 group shadow-sm'>
            <Link href={`/events/${event._id}`} className='flex items-center justify-center gap-1 text-foreground hover:text-orange-500 transition-colors font-semibold text-sm'>
                <span>{matchInformation.day}</span>
                <span className='uppercase'>{matchInformation.month}</span>
                <span className='text-muted-foreground'>{matchInformation.year}</span>
            </Link>
            {event.requiresApplication && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded-sm text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest mt-[-8px]">
                    <ClipboardList size={12} />
                    Application Required
                </div>
            )}
            <section className='flex w-full items-center flex-col justify-center'>

                <div className='flex items-center flex-col gap-2'>
                    <Link href={`/events/${event._id}`} className="flex lg:flex-row flex-col items-center gap-2 group/match">
                        <section className='flex flex-col lg:flex-row h-20 lg:h-40 justify-between items-center gap-1'>
                            <span className='text-center text-foreground group-hover/match:text-orange-500 transition-colors font-bold'>{matchInformation.homeTeam}</span>
                            <Image
                                src={matchInformation.homeLogo ?? "https://placehold.co/400"}
                                alt='home logo'
                                className='h-14 lg:h-24 lg:w-24 h w-14 transition-transform group-hover/match:scale-110 object-contain'
                                height={100}
                                width={100}
                            />
                        </section>
                        <p className={'text-muted-foreground font-black text-xs'}>VS</p>
                        <section className='flex flex-col h-20 lg:flex-row lg:h-40 justify-center items-center gap-1'>
                            <Image
                                src={matchInformation.awayLogo ?? "https://placehold.co/400"}
                                alt='away logo'
                                height={100}
                                objectFit='cover'
                                className='h-14 lg:h-24 lg:w-24 h w-14 transition-transform group-hover/match:scale-110 object-contain'
                                width={100}
                            />
                            <span className='text-center text-foreground group-hover/match:text-orange-500 transition-colors font-bold'>{matchInformation.awayTeam}</span>
                        </section>
                    </Link>

                    <div className='flex flex-col items-center w-full gap-2'>
                        <div className="flex w-full gap-2 items-start">
                            <div className="flex-1">
                                <Dialog>
                                    <div className='flex flex-col w-full mt-1'>
                                        <DialogTrigger asChild>
                                            <Button
                                                className='bg-orange-500 hover:bg-orange-600 text-white font-bold active:translate-y-0.5 duration-200 text-base rounded-sm w-full shadow-sm'>
                                                Book Ticket
                                            </Button>
                                        </DialogTrigger>
                                    </div>
                                    <BookEventModal eventId={event._id} />
                                </Dialog>
                            </div>

                            {/* Admin Quick Actions */}
                            {(isAdmin) && (
                                <div className="flex gap-1 flex-col">
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push(`/u/a/events/${event._id}/edit`)}
                                        className="border-border bg-muted hover:bg-muted/80 text-foreground text-xs h-8 px-2 rounded-sm"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={onDelete}
                                        className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-none text-xs h-8 px-2 rounded-sm"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                        <section className='mt-2 text-center'>
                            <span className='text-muted-foreground flex items-center gap-1 text-xs'>
                                <span className='text-orange-500 font-bold'>{matchInformation.time}</span> @ <span
                                    className='text-xs font-medium'>{matchInformation.venue}</span>
                            </span>

                        </section>
                    </div>
                </div>
            </section>

        </section>
    )
}

export default EventCard