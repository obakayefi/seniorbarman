import React, { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Calendar, Clock, MapPin } from "lucide-react"
import { getBaseUrl, formatEventTime } from '@/lib/utils'

interface TicketZipRendererProps {
    ticket: {
        event?: any;
        stand?: string;
        holderName?: string;
        ticketNumber?: string;
        checkInToken?: string;
        price?: number;
        generatedBy?: string;
    };
    templateMode?: boolean;
    compactView?: boolean;
}

const TicketZipRenderer = forwardRef<HTMLDivElement, TicketZipRendererProps>(({ ticket, templateMode, compactView }, ref) => {
    const baseUrl = getBaseUrl();

    if (!ticket) return null;

    const isSports = ticket.event?.type === 'sports';
    const homeName = ticket.event?.homeTeam?.name || ticket.event?.homeTeam || "";
    const awayName = ticket.event?.awayTeam?.name || ticket.event?.awayTeam || "";
    const eventTitle = isSports
        ? `${homeName} vs ${awayName}`
        : (ticket.event?.title || "Special Event");

    if (compactView) {
        return (
            <div ref={ref} className="bg-white text-black font-sans w-[50mm] h-[40mm] border-[0.5pt] border-zinc-200 flex flex-col items-center justify-center relative overflow-hidden shadow-sm p-2 text-center">
                <div className="absolute top-1 left-0 right-0 px-2">
                    <h3 className="text-[8px] font-black uppercase text-black leading-tight line-clamp-2">
                        {eventTitle}
                    </h3>
                </div>
                
                <div className="bg-zinc-50 rounded-lg p-1.5 border border-zinc-100 flex flex-col items-center justify-center my-2">
                    {!templateMode ? (
                        <QRCodeSVG
                            value={`${baseUrl}/tickets/p/${ticket.checkInToken}`}
                            size={70}
                            level="M"
                            includeMargin={false}
                        />
                    ) : (
                        <div className="h-[70px] w-[70px] bg-zinc-100/50 rounded-lg animate-pulse" />
                    )}
                </div>

                <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center gap-0.5">
                    <span className="text-[7px] font-black border-[0.3pt] border-zinc-400 text-black px-1.5 py-0.5 rounded-sm uppercase tracking-widest bg-zinc-50">
                        {ticket.stand || "REGULAR"}
                    </span>
                    {!templateMode && (
                        <span className="text-[6px] font-mono text-zinc-400">#{ticket.ticketNumber?.slice(-8).toUpperCase()}</span>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div ref={ref} className="bg-white text-black font-sans w-[100mm] h-[65mm] border-[0.5pt] border-zinc-200 rounded-2xl flex flex-col relative overflow-hidden shadow-sm">
            {/* Header (Optimized for B&W Printers) */}
            <div className="h-[22mm] w-full relative overflow-hidden bg-white border-b-[0.5pt] border-zinc-200 shrink-0">
                <div className="absolute top-2 left-3">
                    <span className="text-[7px] font-black text-zinc-500 tracking-[0.2em] uppercase">SeniorBarman Official</span>
                </div>
                <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                    <h3 className="text-[11px] font-black uppercase text-black leading-tight line-clamp-2 pr-2">
                        {eventTitle}
                    </h3>
                    <span className="text-[8px] font-black border-[0.5pt] border-zinc-400 text-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter bg-zinc-50 whitespace-nowrap shrink-0">
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
                            <span className="text-[9px] font-bold text-zinc-800 truncate block max-w-[120px]">
                                {ticket.event?.venue || "Main Stadium"}
                            </span>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 flex flex-col gap-0.5">
                        {!templateMode && (
                            <div className="flex justify-between items-end">
                                <span className="text-[14px] font-black text-orange-600">
                                    {ticket.price! > 0 ? `₦${Number(ticket.price).toLocaleString()}` : "COMPLIMENTARY"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* QR Column - Widened for larger QR code */}
                <div className="w-[34mm] flex flex-col items-center justify-center bg-zinc-50 rounded-xl p-1.5 border border-zinc-100 shrink-0">
                    {!templateMode ? (
                        <>
                            <QRCodeSVG
                                value={`${baseUrl}/tickets/p/${ticket.checkInToken}`}
                                size={95}
                                level="H"
                                includeMargin={false}
                            />
                            <div className="mt-1.5 flex flex-col items-center">
                                <span className="text-[8px] font-black text-zinc-400 leading-none">SCAN GATE</span>
                                <span className="text-[7px] font-mono text-zinc-300 mt-0.5">#{ticket.ticketNumber?.slice(-8).toUpperCase()}</span>
                            </div>
                        </>
                    ) : (
                        <div className="h-[90px] w-[90px] bg-zinc-100/50 rounded-lg animate-pulse" />
                    )}
                </div>
            </div>

            {/* Bottom Footer Section for Holder */}
            {!templateMode && (
                <div className="absolute bottom-0 left-0 right-0 h-[10mm] bg-zinc-50 border-t-[0.5pt] border-zinc-200 px-3 flex items-center justify-between">
                    <div className="flex items-baseline gap-1 truncate">
                        <span className="text-[7px] uppercase font-black text-zinc-400">Holder:</span>
                        <span className="text-[9px] font-black text-zinc-900 truncate uppercase">{ticket.holderName || "Guest"}</span>
                    </div>
                    <span className="text-[6px] font-black text-zinc-300 tracking-widest uppercase italic">Valid For Single Entry Only</span>
                </div>
            )}

            {/* Perforation line simulation */}
            <div className="absolute left-0 right-0 bottom-[14mm] border-t border-dashed border-zinc-200"></div>
            <div className="absolute -left-1.5 bottom-[12.5mm] w-3 h-3 bg-white border border-zinc-200 rounded-full"></div>
            <div className="absolute -right-1.5 bottom-[12.5mm] w-3 h-3 bg-white border border-zinc-200 rounded-full"></div>
        </div>
    );
});

TicketZipRenderer.displayName = "TicketZipRenderer"
export default TicketZipRenderer
