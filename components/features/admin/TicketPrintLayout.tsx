import React, { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Calendar, Clock, MapPin } from "lucide-react"
import { getBaseUrl, formatEventTime } from '@/lib/utils'

interface TicketPrintLayoutProps {
    tickets: any[]
    type: string
    eventId: string
}

const TicketPrintLayout = forwardRef<HTMLDivElement, TicketPrintLayoutProps>(({ tickets, type, eventId }, ref) => {
    // Base URL for QR codes
    const baseUrl = getBaseUrl();

    const isStandard = type === 'standard';

    if (isStandard) {
        return (
            <div ref={ref} className="bg-white w-[210mm] min-h-[297mm] p-[10mm] text-black font-sans">
                {/* A4 Grid: 4 columns, 5-6 rows */}
                <div className="grid grid-cols-4 gap-4">
                    {tickets.map((ticket) => (
                        <div key={ticket._id} className="border border-zinc-200 p-2.5 flex flex-col items-center text-center gap-1.5 rounded-xl bg-zinc-50/30">
                            {/* Logo at the top */}
                            <div className="h-4 flex items-center justify-center mb-0.5">
                                <img src="/logo.png" alt="Logo" className="h-full object-contain grayscale" />
                            </div>

                            <QRCodeSVG
                                value={`${baseUrl}/tickets/p/${ticket.checkInToken}`}
                                size={135} // Increased to take up max available width
                                level="H"
                                includeMargin={false}
                            />

                            <div className="w-full space-y-0.5">
                                <p className="text-[9px] font-black uppercase text-zinc-900 truncate leading-none">
                                    {ticket.event?.title || ticket.event?.homeTeam || "Event Ticket"}
                                </p>
                                <p className="text-[7px] font-mono text-zinc-400 leading-none">#{ticket.ticketNumber?.slice(-8).toUpperCase()}</p>
                                <div className="pt-1 border-t border-zinc-100 mt-0.5">
                                    <p className="text-[8px] font-black text-orange-600 leading-none">
                                        {ticket.stand?.toUpperCase()} • ₦{Number(ticket.price).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div ref={ref} className="bg-white w-[210mm] min-h-[297mm] p-[10mm] text-black font-sans">
            {/* A4 Grid: 2 columns, 5-6 rows to allow for taller, more premium tickets */}
            <div className="grid grid-cols-2 gap-x-[6mm] gap-y-[8mm]">
                {tickets.map((ticket) => {
                    const isSports = ticket.event?.type === 'sports';
                    const homeName = ticket.event?.homeTeam?.name || ticket.event?.homeTeam || "";
                    const awayName = ticket.event?.awayTeam?.name || ticket.event?.awayTeam || "";
                    const eventTitle = isSports
                        ? `${homeName} vs ${awayName}`
                        : (ticket.event?.title || "Special Event");

                    return (
                        <div key={ticket._id} className="border-[0.5pt] border-zinc-200 rounded-2xl flex flex-col h-[65mm] relative overflow-hidden bg-white shadow-sm">
                            {/* Top Banner / Event Title (Optimized for B&W Printers) */}
                            <div className="h-[22mm] w-full relative overflow-hidden bg-white border-b-[0.5pt] border-zinc-200">
                                <div className="absolute top-2 left-3">
                                    <span className="text-[7px] font-black text-zinc-500 tracking-[0.2em] uppercase">SeniorBarman Official</span>
                                </div>
                                <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                                    <h3 className="text-[11px] font-black uppercase text-black leading-tight line-clamp-2 pr-2">
                                        {eventTitle}
                                    </h3>
                                    <span className="text-[8px] font-black border-[0.5pt] border-zinc-400 text-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter bg-zinc-50 whitespace-nowrap">
                                        {ticket.stand || "REGULAR"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-1 p-3 gap-3">
                                {/* Details Column */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={10} className="text-orange-600" />
                                            <span className="text-[9px] font-bold text-zinc-800">
                                                {ticket.event?.date ? new Date(ticket.event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBA'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={10} className="text-orange-600" />
                                            <span className="text-[9px] font-bold text-zinc-800">
                                                {formatEventTime(ticket.event?.date)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={10} className="text-orange-600" />
                                            <span className="text-[9px] font-bold text-zinc-800 truncate block w-32">
                                                {ticket.event?.venue || "Main Stadium"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-zinc-100 flex flex-col gap-0.5">
                                        <div className="flex justify-between items-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                                            <span>Holder</span>
                                            <span>Price</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black text-zinc-900 truncate max-w-[80px]">
                                                {ticket.holderName || "Guest"}
                                            </span>
                                            <span className="text-sm font-black text-orange-600">
                                                ₦{Number(ticket.price).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* QR Column - Widened for larger QR code */}
                                <div className="w-[34mm] flex flex-col items-center justify-center bg-zinc-50 rounded-xl p-1.5 border border-zinc-100">
                                    <QRCodeSVG
                                        value={`${baseUrl}/tickets/p/${ticket.checkInToken}`}
                                        size={95} // Increased from 75 for better scanning
                                        level="H" // High error correction for smudges
                                        includeMargin={false}
                                    />
                                    <div className="mt-1.5 flex flex-col items-center">
                                        <span className="text-[8px] font-black text-zinc-400 leading-none">SCAN GATE</span>
                                        <span className="text-[7px] font-mono text-zinc-300 mt-0.5">#{ticket.ticketNumber?.slice(-8).toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Perforation line simulation */}
                            <div className="absolute left-0 right-0 bottom-[14mm] border-t border-dashed border-zinc-200"></div>
                            <div className="absolute -left-1.5 bottom-[12.5mm] w-3 h-3 bg-white border border-zinc-200 rounded-full"></div>
                            <div className="absolute -right-1.5 bottom-[12.5mm] w-3 h-3 bg-white border border-zinc-200 rounded-full"></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

TicketPrintLayout.displayName = "TicketPrintLayout"
export default TicketPrintLayout
