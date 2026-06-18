"use client";

import { Calendar1, ChevronLeft, ChevronRight, ClipboardList, Pencil, Shield, Trash2, Archive, ArchiveRestore, ArrowLeft } from "lucide-react";
import { SlLocationPin } from "react-icons/sl";
import NButton from "../native/NButton";
import { Dialog, DialogTrigger } from "./dialog";
import { BookRegularEventModal } from "../modals/book-regular-event";
import { DeleteConfirmModal } from "../modals/delete-confirm-modal";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HunchoRoleChecker } from "@/lib/helpers";

export default function RegularEventCard({ event }: { event: any }) {
    const { user } = useApp();
    const router = useRouter();
    const [formattedDate, setFormattedDate] = useState("");
    const [slide, setSlide] = useState(0);
    const trackRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);

    useEffect(() => {
        if (event.date) {
            setFormattedDate(
                new Date(event.date).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                })
            );
        }
    }, [event.date]);

    const isAdmin = HunchoRoleChecker(user?.role);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const totalSlides = isAdmin ? 2 : 1;

    const goTo = (index: number) => {
        setSlide(index);
        if (trackRef.current) {
            trackRef.current.style.transform = `translateX(-${index * 100}%)`;
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 40) {
            // Swipe left → next, swipe right → prev
            goTo(delta > 0
                ? Math.min(totalSlides - 1, slide + 1)
                : Math.max(0, slide - 1)
            );
        }
        touchStartX.current = null;
    };

    const onDelete = async () => {
        if (
            !confirm(
                "Removing this event will nullify all associated tickets. Do you also want to permanently delete its associated tickets as well?"
            )
        ) return;

        const deleteTickets = confirm(
            "Do you also want to delete all tickets associated with this event? (Recommended to avoid orphaned tickets)"
        );

        setIsDeleting(true);
        try {
            if (deleteTickets) {
                await api.delete(`/tickets?eventId=${event._id}`);
            }
            const res = await api.delete(`/events/${event._id}?type=event`);
            if (res.status === 200) {
                toast.success("Event and associated tickets deleted");
                window.location.reload();
            }
        } catch {
            toast.error("Failed to delete event");
        } finally {
            setIsDeleting(false);
        }
    };

    const onArchiveToggle = async () => {
        setIsArchiving(true);
        try {
            const res = await api.patch(`/admin/events/${event._id}/archive`);
            if (res.status === 200) {
                toast.success(res.data.message);
                window.location.reload();
            }
        } catch {
            toast.error("Failed to update archive status");
        } finally {
            setIsArchiving(false);
        }
    };

    const handleApplyClick = (e?: React.MouseEvent) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (!user) {
            localStorage.setItem("pendingApplication", JSON.stringify({
                eventId: event._id,
                eventTitle: event.type === "sports"
                    ? `${event.homeTeam} vs ${event.awayTeam}`
                    : event.title,
            }));
            router.push(`/auth/register?redirect=/events/${event._id}`);
            return;
        }
        router.push(`/u/events/${event._id}/apply`);
    };

    const isAudition = event.isAudition;
    const noTickets =
        event.allowNoTickets || !event.ticketTypes || event.ticketTypes.length === 0;

    return (
        <section className="min-w-76 w-full rounded-xl border-[1.5px] border-zinc-900 overflow-hidden group transition-shadow duration-500 hover:shadow-[0_0_10px_rgba(34,197,94,0.2)] hover:border-zinc-800 flex flex-col h-full">
            {/* Event Image */}
            <Link href={`/events/${event._id}`} className="block bg-zinc-800 overflow-hidden shrink-0 relative">
                <img
                    src={event.image || "https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024"}
                    alt={event.title}
                    className="w-full h-62 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
                />
                {event.requiresApplication && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-blue-700 border border-white/20 text-[10px] font-black uppercase tracking-widest shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                        <ClipboardList size={12} className="text-blue-600" />
                        Application Required
                    </div>
                )}
            </Link>

            {/* Carousel body */}
            <div className="flex flex-col flex-1 bg-zinc-950 overflow-hidden">
                {/* Sliding track — touch events enable swipe on mobile */}
                <div
                    className="relative flex-1 overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        ref={trackRef}
                        className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
                        style={{ width: `${totalSlides * 100}%`, transform: `translateX(-${slide * (100 / totalSlides)}%)` }}
                    >
                        {/* ── SLIDE 1: Event Info ── */}
                        <div
                            className="p-2 py-6 flex flex-col gap-8 text-zinc-100 px-6 flex-1 justify-between"
                            style={{ width: `${100 / totalSlides}%`, flexShrink: 0 }}
                        >
                            <section className="flex gap-2 flex-col">
                                <section className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/events/${event._id}`} className="hover:text-amber-500 transition-colors">
                                            <h2 className="text-xl">{event.title}</h2>
                                        </Link>
                                        {event.isArchived && (
                                            <span className="px-2 py-0.5 text-[9px] font-black tracking-widest uppercase bg-amber-500/20 text-amber-500 rounded border border-amber-500/30">Archived</span>
                                        )}
                                    </div>
                                    <p className="text-sm flex gap-2 text-zinc-600">
                                        <span><Calendar1 size={16} /></span>{formattedDate}
                                    </p>
                                    <p className="flex items-center gap-2 text-sm text-zinc-600">
                                        <span><SlLocationPin /></span> {event.venue}
                                    </p>
                                    {event.requiresApplication && (
                                        <button
                                            onClick={handleApplyClick}
                                            className="group flex w-fit items-center gap-2 mt-2 px-4 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-500 rounded-full text-xs font-black uppercase tracking-widest transition-colors"
                                        >
                                            Apply Here
                                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-300 inline-block" />
                                        </button>
                                    )}
                                </section>
                            </section>

                            <section className="flex w-full items-end justify-between">
                                <div className="flex flex-col gap-1">
                                    {event.ticketTypes?.slice(0, 2).map((ticket: any, index: number) => (
                                        <div key={index}>
                                            <span className="text-xs text-zinc-600 uppercase">{ticket.name}</span>
                                            <p className={`text-xl font-semibold ${index === 0 ? "text-green-400" : "text-yellow-500"}`}>
                                                {Number(ticket.price || 0) <= 0 ? "FREE" : (
                                                    <>₦ <span className="text-white">{Number(ticket.price).toLocaleString()}</span></>
                                                )}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* User-facing CTA */}
                                <div className="flex flex-col gap-2 min-w-[120px]">
                                    {!noTickets && (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <NButton className="bg-green-800 hover:bg-green-700 w-full">BUY TICKETS</NButton>
                                            </DialogTrigger>
                                            <BookRegularEventModal event={event} />
                                        </Dialog>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* ── SLIDE 2: Admin Controls (admin only) ── */}
                        {isAdmin && (
                            <div
                                className="py-6 px-6 flex flex-col justify-between text-zinc-100"
                                style={{ width: `${100 / totalSlides}%`, flexShrink: 0 }}
                            >
                                {/* Admin header */}
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                        <Shield size={14} className="text-amber-400" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
                                        Admin Controls
                                    </span>
                                </div>

                                {/* Quick info recap */}
                                <div className="flex flex-col gap-1 mb-6 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                                    <p className="text-sm font-semibold text-zinc-200 truncate">{event.title}</p>
                                    <p className="text-xs text-zinc-500">{formattedDate}</p>
                                    <p className="text-xs text-zinc-500 truncate">{event.venue}</p>
                                </div>

                                {/* Admin action buttons */}
                                <div className="flex flex-col gap-2 w-full mt-auto">
                                    <NButton
                                        onClick={() => router.push(`/u/a/events/${event._id}/edit`)}
                                        className="flex items-center justify-center gap-2 bg-zinc-800 border border-zinc-700 hover:border-zinc-500 w-full text-xs py-2"
                                    >
                                        <Pencil size={13} />
                                        EDIT EVENT
                                    </NButton>
                                    <NButton
                                        onClick={onArchiveToggle}
                                        disabled={isArchiving}
                                        className="flex items-center justify-center gap-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/20 w-full text-xs py-2"
                                    >
                                        {event.isArchived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                                        {event.isArchived ? "UNARCHIVE" : "ARCHIVE"} EVENT
                                    </NButton>
                                    <DeleteConfirmModal
                                        onConfirm={onDelete}
                                        isDeleting={isDeleting}
                                        trigger={
                                            <NButton className="flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 w-full text-xs py-2">
                                                <Trash2 size={13} />
                                                DELETE EVENT
                                            </NButton>
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Futuristic Carousel Indicator (admin only) ── */}
                {isAdmin && (
                    <div className="flex items-center justify-center gap-1 py-2 px-4 border-t border-zinc-900/60">
                        {/* Prev arrow — large tap target for mobile */}
                        <button
                            onClick={() => goTo(Math.max(0, slide - 1))}
                            disabled={slide === 0}
                            aria-label="Previous slide"
                            className="flex items-center justify-center w-10 h-10 rounded-full text-zinc-500 hover:text-zinc-200 active:text-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {/* Pill indicators — padded for touch */}
                        <div className="flex items-center gap-2 px-1">
                            {Array.from({ length: totalSlides }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goTo(i)}
                                    aria-label={i === 0 ? "Event info" : "Admin controls"}
                                    style={{
                                        /* Invisible padding gives a minimum 44×44 px tap target */
                                        padding: "18px 8px",
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "block",
                                            width: slide === i ? "28px" : "8px",
                                            height: "8px",
                                            borderRadius: "999px",
                                            transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                                            background: slide === i
                                                ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                                                : "rgba(113,113,122,0.5)",
                                            boxShadow: slide === i
                                                ? "0 0 8px rgba(245,158,11,0.7), 0 0 20px rgba(239,68,68,0.3)"
                                                : "none",
                                            flexShrink: 0,
                                        }}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Next arrow — large tap target for mobile */}
                        <button
                            onClick={() => goTo(Math.min(totalSlides - 1, slide + 1))}
                            disabled={slide === totalSlides - 1}
                            aria-label="Next slide"
                            className="flex items-center justify-center w-10 h-10 rounded-full text-zinc-500 hover:text-zinc-200 active:text-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}