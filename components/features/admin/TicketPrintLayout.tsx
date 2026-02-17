import React, { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Calendar, Clock, MapPin } from "lucide-react"

interface TicketPrintLayoutProps {
    tickets: any[]
    type: string
    eventId: string
}

const TicketPrintLayout = forwardRef<HTMLDivElement, TicketPrintLayoutProps>(({ tickets, type, eventId }, ref) => {

    // Base URL for QR codes
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://seniorbarman.com";

    if (type === 'sports') {
        return (
            <div ref={ref} className="bg-white w-[210mm] min-h-[297mm] p-[5mm] text-black font-sans">
                {/* A4 Grid: 2 columns, 7 rows = 14 tickets per page */}
                <div className="grid grid-cols-2 gap-x-[4mm] gap-y-[4mm]">
                    {tickets.map((ticket) => (
                        <div key={ticket._id} className="border-2 border-dashed border-zinc-300 rounded-lg p-3 flex flex-row h-[40mm] relative overflow-hidden bg-zinc-50">
                            {/* Left: Event Details */}
                            <div className="flex-1 flex flex-col justify-between pr-2 border-r border-dashed border-zinc-300">
                                <div>
                                    <h3 className="text-sm font-black uppercase leading-tight truncate w-full">
                                        {ticket.event?.homeTeam || "Home"} vs {ticket.event?.awayTeam || "Away"}
                                    </h3>
                                    <div className="flex gap-2 mt-1">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={10} className="text-zinc-500" />
                                            <span className="text-[9px] font-bold">
                                                {ticket.event?.date ? new Date(ticket.event.date).toLocaleDateString() : 'TBA'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={10} className="text-zinc-500" />
                                            <span className="text-[9px] font-bold">
                                                {ticket.event?.date ? new Date(ticket.event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBA'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <MapPin size={10} className="text-zinc-500" />
                                        <span className="text-[9px] font-semibold truncate w-32">{ticket.event?.venue || "Venue"}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-mono text-zinc-400">{ticket.ticketNumber}</span>
                                    <span className="text-xs font-black bg-zinc-900 text-white px-2 py-0.5 rounded">{ticket.stand}</span>
                                </div>
                            </div>

                            {/* Right: QR & Price */}
                            <div className="w-[30mm] flex flex-col items-center justify-center pl-2 gap-1">
                                <QRCodeSVG
                                    value={`${baseUrl}/tickets/p/${ticket.checkInToken}`}
                                    size={80}
                                    level="M"
                                />
                                <span className="text-[10px] font-bold">₦{Number(ticket.price).toLocaleString()}</span>
                            </div>

                            {/* Cutout visuals */}
                            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-r border-zinc-300 rounded-full"></div>
                            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-zinc-300 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Standard Layout (Matchbox size - denser grid)
    return (
        <div ref={ref} className="bg-white w-[210mm] min-h-[297mm] p-[10mm] text-black font-sans">
            <div className="grid grid-cols-4 gap-4">
                {tickets.map((ticket) => (
                    <div key={ticket._id} className="border border-zinc-200 p-2 flex flex-col items-center text-center gap-2 rounded-md">
                        <QRCodeSVG
                            value={`${baseUrl}/tickets/p/${ticket.checkInToken}`}
                            size={100}
                            level="L"
                        />
                        <div className="w-full">
                            <p className="text-[10px] font-bold truncate w-full">{ticket.event?.title || "Event Ticket"}</p>
                            <p className="text-[8px] font-mono text-zinc-500">{ticket.ticketNumber}</p>
                            <p className="text-[10px] font-bold mt-1">{ticket.stand} - ₦{Number(ticket.price).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
})

TicketPrintLayout.displayName = "TicketPrintLayout"
export default TicketPrintLayout
