"use client";

import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import NButton from "../native/NButton";
import { DeleteConfirmModal } from "../modals/delete-confirm-modal";
import { Dialog, DialogTrigger } from "./dialog";
import { BookRegularEventModal } from "../modals/book-regular-event";
import Link from "next/link";
import { Hand } from "lucide-react";

interface EventCardControlsProps {
    event: any;
    isAdmin: boolean;
    onDelete: () => void;
    isDeleting: boolean;
}

export default function EventCardControls({ event, isAdmin, onDelete, isDeleting }: EventCardControlsProps) {
    const router = useRouter();
    const { user } = useApp();

    const isAudition = event.isAudition;
    const noTickets = event.allowNoTickets || !event.ticketTypes || event.ticketTypes.length === 0;

    const handleApplyClick = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (!user) {
            localStorage.setItem('pendingApplication', JSON.stringify({ 
                eventId: event._id, 
                eventTitle: event.type === 'sports' ? `${event.homeTeam} vs ${event.awayTeam}` : event.title 
            }))
            router.push(`/auth/register?redirect=/events/${event._id}`)
            return;
        }
        router.push(`/u/events/${event._id}/apply`)
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* CRUD Controls for Admins */}
            {isAdmin && (
                <div className="flex flex-col gap-1 w-full text-right items-end border-b border-border pb-3 mb-1">
                    <NButton
                        onClick={() => router.push(`/u/a/events/${event._id}/edit`)}
                        className="bg-muted text-foreground hover:bg-muted/80 border border-border w-full text-xs py-1 rounded-sm"
                    >
                        EDIT EVENT
                    </NButton>
                    <DeleteConfirmModal
                        onConfirm={onDelete}
                        isDeleting={isDeleting}
                        trigger={
                            <NButton
                                className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 w-full text-xs py-1 rounded-sm"
                            >
                                DELETE EVENT
                            </NButton>
                        }
                    />
                </div>
            )}

            {/* Application / Ticketing Controls */}
            {isAudition ? (
                noTickets ? (
                    /* Audition without tickets: Wide Apply Here button */
                    <NButton 
                        onClick={handleApplyClick}
                        className="bg-orange-500 hover:bg-orange-600 text-white w-full rounded-sm uppercase"
                    >
                        {event.ctaText || "APPLY HERE"}
                    </NButton>
                ) : (
                    /* Audition with tickets: Buy Tickets + Ghost Apply Here link */
                    <div className="flex flex-col gap-2 w-full">
                        <Dialog>
                            <DialogTrigger asChild>
                                <NButton className="bg-green-700 hover:bg-green-600 text-white w-full rounded-sm uppercase">
                                    {event.ctaText || "BUY TICKETS"}
                                </NButton>
                            </DialogTrigger>
                            <BookRegularEventModal event={event} />
                        </Dialog>
                        
                        <button 
                            onClick={handleApplyClick}
                            className="group flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-orange-500 transition-colors py-1 cursor-pointer bg-transparent border-none"
                        >
                            <span className="animate-bounce-loop inline-block">
                                👉
                            </span>
                            <span className="font-medium underline underline-offset-4">Apply Here</span>
                        </button>
                    </div>
                )
            ) : (
                /* Regular Event: Just Buy Tickets */
                <Dialog>
                    <DialogTrigger asChild>
                        <NButton className="bg-green-700 hover:bg-green-600 text-white w-full rounded-sm uppercase">
                            {event.ctaText || "BUY TICKETS"}
                        </NButton>
                    </DialogTrigger>
                    <BookRegularEventModal event={event} />
                </Dialog>
            )}
        </div>
    );
}
