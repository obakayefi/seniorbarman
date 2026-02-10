"use client"
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Download, Printer, Share2, Mail } from 'lucide-react';
import { useQRCode } from "next-qrcode";
import { extractTicketStatus, formattedDate, formatTime, getBaseUrl } from "@/lib/utils";
import { MdStadium } from "react-icons/md";
import { FaClock } from "react-icons/fa6";
import { BsFillCalendarDateFill } from "react-icons/bs";
import { toPng } from 'html-to-image';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

interface TicketCarouselProps {
    tickets: any[];
    eventInfo: any;
    user?: any;
}

export default function TicketCarousel({ tickets, eventInfo, user }: TicketCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailAddress, setEmailAddress] = useState('');
    const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [emailError, setEmailError] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const ticketRef = useRef<HTMLDivElement>(null);
    const { Image: QRImage } = useQRCode();
    const { user: currentUser } = useApp();

    if (!tickets || tickets.length === 0) return null;

    // Group tickets by type
    const ticketTypes = Array.from(new Set(tickets.map((t: any) => t.stand || t.ticketType || 'General')));
    const filteredTickets = selectedType
        ? tickets.filter((t: any) => (t.stand || t.ticketType || 'General') === selectedType)
        : tickets;

    const currentTicket = filteredTickets[currentIndex];
    const totalTickets = filteredTickets.length;

    // Reset index when changing type
    const handleTypeChange = (type: string | null) => {
        setSelectedType(type);
        setCurrentIndex(0);
    };

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalTickets - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < totalTickets - 1 ? prev + 1 : 0));
    };

    const goToTicket = (index: number) => {
        setCurrentIndex(index);
    };

    const status_checkedIn = extractTicketStatus(currentTicket.checkInLogs) === "Checked In";
    const status_checkedOut = extractTicketStatus(currentTicket.checkInLogs) === "Checked Out";
    const status_notCheckedIn = extractTicketStatus(currentTicket.checkInLogs) === "Not Checked In";

    const statusBgColor = status_checkedIn
        ? "bg-orange-500 text-white"
        : status_checkedOut
            ? "bg-red-500 text-white"
            : "bg-zinc-700 text-zinc-300";

    const formattedDate = (_date: Date) => {
        const date = new Date(_date);
        return date.toDateString();
    };

    // Generate page indicators (show max 5 at a time)
    const getPageIndicators = () => {
        const maxVisible = 5;
        let start = Math.max(0, currentIndex - Math.floor(maxVisible / 2));
        let end = Math.min(totalTickets, start + maxVisible);

        if (end - start < maxVisible) {
            start = Math.max(0, end - maxVisible);
        }

        return Array.from({ length: end - start }, (_, i) => start + i);
    };

    // Download ticket as PDF
    const downloadPDF = async () => {
        if (!ticketRef.current) return;

        setIsDownloading(true);
        try {
            const dataUrl = await toPng(ticketRef.current, {
                cacheBust: true,
                pixelRatio: 2,
            });

            const link = document.createElement('a');
            link.download = `ticket-${currentTicket._id?.slice(-8) || 'download'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to download ticket:', error);
            alert('Failed to download ticket. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Email ticket function
    const handleEmailTicket = async () => {
        if (!emailAddress || !emailAddress.includes('@')) {
            setEmailStatus('error');
            setEmailError('Please enter a valid email address');
            return;
        }

        setEmailStatus('loading');
        setEmailError('');

        try {
            const response = await fetch('/api/tickets/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipientEmail: emailAddress,
                    ticketId: currentTicket._id || 'N/A',
                    eventTitle: eventInfo?.homeTeam
                        ? `${eventInfo.homeTeam} vs ${eventInfo.awayTeam}`
                        : eventInfo?.title,
                    eventDate: new Date(eventInfo?.date).toDateString(),
                    eventTime: formatTime(eventInfo?.time) || '17:00',
                    eventVenue: eventInfo?.venue,
                    ticketType: currentTicket.stand || currentTicket.ticketType || 'General',
                    qrCodeUrl: `${getBaseUrl()}/tickets/p/${currentTicket.checkInToken}/`,
                    hashToken: currentTicket.checkInToken,
                    senderName: 'Your Friend',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send email');
            }

            setEmailStatus('success');
            setTimeout(() => {
                // Keep success state for a bit then we can auto-close or let user close
            }, 2000);
        } catch (error: any) {
            console.error('Failed to send email:', error);
            setEmailStatus('error');
            setEmailError(error.message || 'Something went wrong. Please try again.');
        }
    };

    const closeEmailModal = () => {
        setShowEmailModal(false);
        setEmailAddress('');
        setEmailStatus('idle');
        setEmailError('');
    };

    const handleDeleteTicket = async () => {
        if (!window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/tickets/manage/${currentTicket._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete ticket');
            }

            toast.success('Ticket deleted successfully');
            // Reload the page to reflect changes
            window.location.reload();
        } catch (error: any) {
            console.error('Failed to delete ticket:', error);
            toast.error(error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };


    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-4">
            {/* Header with status badge */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
                <div className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold uppercase ${statusBgColor}`}>
                    {status_checkedIn ? "● Active Pass" : status_notCheckedIn ? "● Not Used" : "● Used"}
                </div>
                {/* 
                <button
                    onClick={() => setShowEmailModal(true)}
                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                    aria-label="Email ticket"
                >
                    <Mail size={20} className="text-zinc-400" />
                </button> 
                */}
            </div>

            {/* Breadcrumb */}
            <div className="w-full text-center text-zinc-500 text-xs sm:text-sm mb-6 px-2">
                <span className="hidden sm:inline">My Tickets › {eventInfo?.homeTeam ? `${eventInfo.homeTeam} vs ${eventInfo.awayTeam}` : eventInfo?.title} › </span><span className="text-white">Pass {currentIndex + 1} of {totalTickets}</span>
            </div>

            {/* Ticket Type Filter */}
            {ticketTypes.length > 1 && (
                <div className="w-full mb-6">
                    <p className="text-zinc-500 text-xs sm:text-sm mb-3 text-center">Filter by ticket type</p>
                    <div className="flex gap-2 justify-center flex-wrap px-2">
                        <button
                            onClick={() => handleTypeChange(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedType === null
                                ? 'bg-orange-500 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                }`}
                        >
                            All ({tickets.length})
                        </button>
                        {ticketTypes.map((type) => {
                            const count = tickets.filter((t: any) => (t.stand || t.ticketType || 'General') === type).length;
                            return (
                                <button
                                    key={type}
                                    onClick={() => handleTypeChange(type)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedType === type
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    {type} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Ticket Card */}
            <div ref={ticketRef} className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 mb-6 shadow-2xl">
                {/* Event Header */}
                <div className="mb-4 sm:mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-orange-400 text-[10px] sm:text-sm font-bold uppercase tracking-widest">
                            {eventInfo?.type === 'sports' ? 'Matchday Pass' : 'Event Pass'}
                        </p>
                        <div className="bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded text-[10px] text-orange-400 font-bold uppercase"> Official </div>
                    </div>

                    <h1 className="text-lg sm:text-2xl font-black text-white mb-4 sm:mb-6 leading-tight tracking-tight">
                        {eventInfo?.homeTeam ? `${eventInfo.homeTeam} vs. ${eventInfo.awayTeam}` : eventInfo?.title}
                    </h1>

                    {/* Variant/Ticket Number */}
                    <div className="flex flex-col gap-6 bg-zinc-800/50 p-4 sm:p-6 -mx-4 sm:-mx-6 border-y border-zinc-700/30">
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="flex flex-col gap-1 items-center text-center">
                                <p className="text-zinc-500 uppercase text-[9px] sm:text-[10px] font-black tracking-widest mb-1">Date</p>
                                <p className="text-white font-bold text-sm sm:text-lg">
                                    {eventInfo?.date ? new Date(eventInfo.date).toLocaleDateString('en-GB') : 'N/A'}
                                </p>
                            </div>
                            <div className="flex flex-col gap-1 items-center text-center">
                                <p className="text-zinc-500 uppercase text-[9px] sm:text-[10px] font-black tracking-widest mb-1">Kickoff</p>
                                <p className="text-white font-bold text-sm sm:text-lg">{formatTime(eventInfo?.time) || '17:00'}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 items-center text-center w-full pt-4 border-t border-zinc-700/30">
                            <p className="text-zinc-500 uppercase text-[9px] sm:text-[10px] font-black tracking-widest mb-1">Venue</p>
                            <p className="text-orange-400 font-black text-base sm:text-xl tracking-tight">{eventInfo?.venue}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-zinc-700/30">
                            <div className="text-center">
                                <p className="text-zinc-500 uppercase text-[9px] sm:text-[10px] font-black tracking-widest mb-1">Gate/Type</p>
                                <p className="text-white font-bold text-sm sm:text-base">{currentTicket.stand || currentTicket.ticketType || 'General'}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-zinc-500 uppercase text-[9px] sm:text-[10px] font-black tracking-widest mb-1">Variant</p>
                                <p className="text-orange-400 font-black text-lg sm:text-xl">
                                    {String(currentIndex + 1).padStart(2, '0')}
                                    <span className="text-zinc-600 font-normal px-1">/</span>
                                    {String(totalTickets).padStart(2, '0')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-6">
                    <div className="bg-white p-6 rounded-lg">
                        <QRImage
                            text={`${getBaseUrl()}/tickets/p/${currentTicket.checkInToken}`}
                            options={{
                                type: 'image/jpeg',
                                quality: 0.3,
                                errorCorrectionLevel: 'M',
                                margin: 2,
                                scale: 4,
                                width: 280,
                                color: {
                                    dark: '#f97316',
                                    light: '#FFF',
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Scans Remaining */}
                <div className="text-center mb-6">
                    <p className="text-orange-400 font-semibold text-lg">
                        {status_notCheckedIn ? `Ready to Scan` : status_checkedIn ? 'Scanned' : 'Expired'}
                    </p>
                    <p className="text-zinc-500 text-sm uppercase">Single Entry Pass</p>
                </div>

                {/* Ticket Details */}
                <div className="flex justify-between gap-4 border-t border-zinc-800 pt-6">
                    <section className='flex flex-col gap-4'>
                        <div>
                            <p className="text-zinc-500 uppercase text-xs mb-1">Venue</p>
                            <p className="text-white">{eventInfo?.venue}</p>
                        </div>
                        <div>
                            <p className="text-zinc-500 uppercase text-xs mb-1">Section</p>
                            <p className="text-white">{currentTicket.stand || currentTicket.ticketType || 'General Admission'}</p>
                        </div>
                    </section>
                    <section className='flex flex-col gap-4 items-end text-right'>
                        <div>
                            <p className="text-zinc-500 uppercase text-xs mb-1">Order ID</p>
                            <p className="text-white text-xs">#{currentTicket._id?.slice(-8) || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-zinc-500 uppercase text-xs mb-1">Holder</p>
                            <p className="text-white">{user ? `${user.firstName} ${user.lastName}` : (currentTicket.createdBy?.firstName ? `${currentTicket.createdBy.firstName} ${currentTicket.createdBy.lastName}` : (currentTicket.email || 'Guest'))}</p>
                        </div>
                    </section>
                </div>

                {/* Present at Gate Button */}
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 sm:py-4 rounded-lg mt-4 sm:mt-6 flex items-center justify-center gap-2 transition-colors text-sm sm:text-base">
                    <MdStadium size={20} />
                    PRESENT AT GATE
                </button>
                <p className="text-center text-zinc-600 text-xs mt-2">Do not share this code. Expires after final scan.</p>
            </div>

            {/* Navigation Controls */}
            {totalTickets > 1 && (
                <>
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={handlePrevious}
                            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                            aria-label="Previous ticket"
                        >
                            <ChevronLeft size={20} className="text-zinc-400" />
                        </button>

                        {/* Page Indicators */}
                        <div className="flex gap-2">
                            {getPageIndicators().map((index) => (
                                <button
                                    key={index}
                                    onClick={() => goToTicket(index)}
                                    className={`w-10 h-10 rounded-full transition-all ${index === currentIndex
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                            aria-label="Next ticket"
                        >
                            <ChevronRight size={20} className="text-zinc-400" />
                        </button>
                    </div>

                    <p className="text-zinc-500 text-sm mb-6">Switch between tickets in your batch</p>
                </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <button
                    onClick={downloadPDF}
                    disabled={isDownloading}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={18} />
                    {isDownloading ? 'Downloading...' : 'Download PDF'}
                </button>

                {/* 
                <button
                    onClick={() => setShowEmailModal(true)}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm sm:text-base"
                >
                    <Mail size={18} />
                    Email Ticket
                </button> 
                */}

                {currentUser?.role === 'admin' && (
                    <button
                        onClick={handleDeleteTicket}
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm sm:text-base disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Ticket'}
                    </button>
                )}
            </div>

        </div>
    );
}
