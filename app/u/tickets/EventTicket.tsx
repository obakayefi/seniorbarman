"use client"
import { MdStadium } from "react-icons/md"
import { BsFillCalendarDateFill } from "react-icons/bs";
import { FaClock, FaTrashCan } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { CLUBS, extractTicketStatus, formatTime, giveLogo } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/axios";
import { AlertTriangle } from "lucide-react";

const EventTicket = ({ event, summary }: { event: any, summary: any }) => {
    // Don't render if event is null or missing ID
    if (!event || !event._id) {
        return null;
    }

    const handleDeleteOrphaned = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("This event has been deleted. Are you sure you want to clear all associated tickets?")) return;

        try {
            const res = await api.delete(`/tickets?eventId=${event._id}`);
            if (res.data.success) {
                toast.success(res.data.message);
                window.location.reload();
            }
        } catch (error: any) {
            toast.error("Failed to delete tickets: " + (error.response?.data?.error || error.message));
        }
    };

    if (event.isOrphaned) {
        return (
            <div className='group relative border border-red-500/20 bg-red-500/5 flex flex-col rounded-sm shadow-sm overflow-hidden min-h-[300px]'>
                <section className="flex justify-between border-b border-red-500/10 p-4 px-6 bg-red-500/5">
                    <div className="flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-[10px]">
                        <AlertTriangle size={14} />
                        <span>Event Deleted</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                        <span>Tickets Nullified</span>
                    </div>
                </section>

                <section className='flex flex-col items-center justify-center gap-4 py-8 px-6 flex-1'>
                    <h2 className='text-2xl font-black text-foreground text-center leading-tight tracking-tighter uppercase grayscale opacity-50'>Deleted Event</h2>
                    <p className="text-muted-foreground text-xs text-center max-w-[250px]">All tickets associated with this event are no longer valid for check-in.</p>
                </section>

                <div className="p-6 bg-muted/20 border-t border-red-500/10 space-y-4">
                    {event?.transformedSummary?.length > 0 && (
                        <section className={'flex items-center flex-wrap gap-2 justify-center opacity-40'}>
                            {event?.transformedSummary.map((t: any) => (
                                <div key={t.name} className='text-center bg-background border border-border px-4 py-2 rounded-sm flex-1 min-w-[100px]'>
                                    <h4 className='text-muted-foreground text-[9px] font-black uppercase tracking-widest mb-1'>{t.name}</h4>
                                    <span className='text-xl font-black text-foreground'>{t.value}</span>
                                </div>
                            ))}
                        </section>
                    )}

                    <button
                        onClick={handleDeleteOrphaned}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-sm font-black uppercase text-[10px] tracking-widest transition-all duration-300 shadow-lg shadow-red-900/20"
                    >
                        <FaTrashCan size={14} />
                        Clear Orphaned Tickets
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {event.type === "sports" ? (
                <Link href={`/u/tickets/${event._id}`}>
                    <div
                        className='group border border-border hover:border-orange-500/50 hover:bg-muted/20 cursor-pointer duration-300 bg-card flex flex-col rounded-sm shadow-sm overflow-hidden min-h-[350px] relative'>
                        {event.hasPendingOrders && (
                            <div className="bg-red-600/90 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 flex items-center justify-center gap-2 shadow-inner w-full">
                                <AlertTriangle size={14} />
                                Ungenerated Orders Available
                            </div>
                        )}
                        <section className="flex justify-between border-b border-border p-4 px-6 bg-muted/30">
                            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                                <BsFillCalendarDateFill className="text-orange-500/60" />
                                <h3 className="text-xs font-black uppercase tracking-widest">{event?.date ? new Date(event.date).toLocaleDateString('en-GB') : 'N/A'}</h3>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                                <h3 className="text-xs font-black uppercase tracking-widest">{formatTime(event?.time)}</h3>
                                <FaClock className="text-orange-500/60" />
                            </div>
                        </section>

                        <section className='flex items-center justify-center gap-4 py-8 px-6 flex-1'>
                            <div className="flex flex-col items-center gap-3 flex-1">
                                <div className="p-2 bg-muted rounded-sm border border-border">
                                    <Image
                                        src={event.homeTeam?.logo || giveLogo(event.homeTeam)}
                                        className={'w-10 h-10 object-contain'}
                                        width={75}
                                        alt="logo"
                                        height={100}
                                    />
                                </div>
                                <h2 className='text-sm sm:text-base font-black text-foreground text-center leading-tight tracking-tight'>{event.homeTeam?.name ?? event.homeTeam}</h2>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <span className='text-[10px] font-black text-orange-500/40 uppercase tracking-[0.3em]'>VS</span>
                            </div>

                            <div className="flex flex-col items-center gap-3 flex-1">
                                <div className="p-2 bg-muted rounded-sm border border-border">
                                    <Image src={event.awayTeam?.logo || giveLogo(event.awayTeam)} className={'w-10 h-10 object-contain'} width={75} alt="logo"
                                        height={100} />
                                </div>
                                <h2 className='text-sm sm:text-base font-black text-foreground text-center leading-tight tracking-tight'>{event.awayTeam?.name ?? event.awayTeam}</h2>
                            </div>
                        </section>

                        <div className="flex flex-col gap-4 p-6 bg-muted/10 border-t border-border">
                            {event?.transformedSummary?.length > 0 ? (
                                <section className={'flex items-center flex-wrap gap-2 justify-center'}>
                                    {event?.transformedSummary.map((t: any) => {
                                        return (
                                            <div key={t.name} className='text-center bg-background border border-border px-4 py-2 rounded-sm flex-1 min-w-[100px]'>
                                                <h4 className='text-muted-foreground text-[9px] font-black uppercase tracking-widest mb-1'>{t.name}</h4>
                                                <span className='text-xl font-black text-foreground'>{t.value}</span>
                                            </div>
                                        )
                                    })}
                                </section>
                            ) : (
                                <div className="text-center py-2 bg-red-500/5 border border-red-500/10 rounded-sm">
                                    <h2 className="text-sm font-black text-red-500/60 uppercase tracking-widest">No Tickets Purchased</h2>
                                </div>
                            )}

                            <div className="text-center flex items-center justify-center gap-3 pt-4 border-t border-border group-hover:bg-orange-500/10 transition-all duration-500 -m-6 mt-2 p-4 px-6">
                                <MdStadium size={20} className="text-orange-500" />
                                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.15em] line-clamp-1">{event.venue}</h3>
                            </div>
                        </div>
                    </div>
                </Link>
            ) : event.type === "event" ? (
                <Link href={`/u/tickets/${event._id}`} className="overflow-hidden ">

                    <div
                        className='group relative border border-border hover:border-orange-500/50 cursor-pointer duration-500 flex flex-col rounded-sm overflow-hidden min-h-[350px] shadow-sm z-0'
                        style={{
                            backgroundImage: `url(${event.image || 'https://www.vibe.com/wp-content/uploads/2023/10/GettyImages-1502049780.jpg?w=1024'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-950/80 to-zinc-900/40 group-hover:via-zinc-950/70 transition-all duration-500 z-0" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col h-full justify-between flex-1">
                            {event.hasPendingOrders && (
                                <div className="bg-red-600/90 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 flex items-center justify-center gap-2 shadow-inner w-full mb-0 border-b border-red-700">
                                    <AlertTriangle size={14} />
                                    Ungenerated Orders Available
                                </div>
                            )}
                            <section className="flex justify-between items-center backdrop-blur-md bg-black/40 p-4 px-6 border-b rounded-t-sm border-white/5">
                                <div className="flex items-center gap-2 text-zinc-300">
                                    <BsFillCalendarDateFill className="text-orange-500" size={14} />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest">{event?.date ? new Date(event.date).toLocaleDateString('en-GB') : 'N/A'}</h3>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-300">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest">{formatTime(event?.time)}</h3>
                                    <FaClock className="text-orange-500" size={14} />
                                </div>
                            </section>

                            <section className='flex flex-col items-center justify-center gap-4 py-8 px-6 flex-1'>
                                <span className="text-orange-500 text-[8px] font-black uppercase tracking-[0.4em] mb-[-10px]">Official Pass</span>
                                <h2 className='text-2xl lg:text-3xl font-black text-white text-center leading-tight tracking-tighter drop-shadow-2xl'>
                                    {event.type === 'sports' ? `${event.homeTeam?.name || event.homeTeam} vs ${event.awayTeam?.name || event.awayTeam}` : event.title}
                                </h2>
                            </section>

                            <div className="flex flex-col gap-6 p-6 pb-0">
                                {event?.transformedSummary?.length > 0 ? (
                                    <section className={'flex items-center gap-2 justify-center'}>
                                        {event?.transformedSummary.map((t: any) => {
                                            return (
                                                <div key={t.name} className='text-center bg-zinc-950/60 backdrop-blur-xl border border-white/10 flex-1 p-3 rounded-sm shadow-xl'>
                                                    <h4 className='text-zinc-500 text-[8px] font-black uppercase tracking-widest mb-1'>{t.name}</h4>
                                                    <span className='text-xl font-black text-white'>{t.value}</span>
                                                </div>
                                            )
                                        })}
                                    </section>
                                ) : (
                                    <div className="text-center py-3 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-sm">
                                        <h2 className="text-[10px] font-black text-red-400 uppercase tracking-widest">No Tickets Purchased</h2>
                                    </div>
                                )}

                                <div className="text-center flex items-center justify-center gap-2 bg-black/60 backdrop-blur-md p-4 px-6 border-t border-white/5 group-hover:border-orange-500/30 transition-all rounded-b-sm duration-500 -mx-6 mt-4">
                                    <MdStadium size={18} className="text-orange-500" />
                                    <h3 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] line-clamp-1">{event.venue}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            ) : null}
        </>
    )
}

export default EventTicket