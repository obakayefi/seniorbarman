"use client"
import React, { SetStateAction } from 'react'
import NButton from "@/components/native/NButton";
import { Power, QrCode, ShieldX, User2Icon, UserCheck, UserMinus } from "lucide-react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { extractTicketStatus, statusBadgeStyle } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { MdReport, MdStadium } from "react-icons/md";
import { PostCheckInActions, PreCheckInActions, TicketOperationType } from "@/app/u/a/scanner/page";
import { Spinner } from "@/components/ui/spinner";
import { TicketOperationStatus } from "@/components/ui/ticket-operation-status";

import { TicketSummary } from "@/types/data";
import { ScanError } from "@/types/scan-error";

type Props = {
    canScan: boolean;
    isAudition: boolean;
    handleScanAction: (detectedCodes: any) => Promise<void>;
    toggleScanModeAction: () => void;
    openApprovalModalAction: boolean;
    updateOpenApprovalModalAction: React.Dispatch<SetStateAction<boolean>>;
    computedStatus: string;
    currentTicket: TicketSummary | null;
    selectedEvent: string;
    handleCheckingUserInAction: () => void;
    handleCheckingUserOutAction: () => void;
    isCheckingUserOut: boolean;
    handleBlockingTicketAction: () => void;
    loading: boolean;
    cleanupDialogStateAction: () => void;
    selectTicketOperationAction: (operation: TicketOperationType) => void;
    resetTicketOperationAction: () => void;
    ticketOperation: TicketOperationType;
    scanError?: ScanError;
    onResetError?: () => void;
    isTeamManager?: boolean;
}


export default function TicketScanner({
    canScan,
    handleScanAction,
    toggleScanModeAction,
    openApprovalModalAction,
    handleBlockingTicketAction,
    currentTicket,
    loading,
    computedStatus,
    isCheckingUserOut,
    cleanupDialogStateAction,
    handleCheckingUserInAction,
    handleCheckingUserOutAction,
    updateOpenApprovalModalAction,
    selectedEvent,
    selectTicketOperationAction,
    ticketOperation,
    resetTicketOperationAction,
    scanError,
    onResetError,
    isAudition,
    isTeamManager
}: Props) {
    const [showAnswers, setShowAnswers] = React.useState(false);


    return (
        <section
            className='md:border-2 bg-transparent md:bg-zinc-900 rounded-lg mt-1 p-4 md:p-8 py-0 flex items-center justify-center overflow-hidden h-auto md:border-zinc-900 w-full'>
            {/* DESKTOP SCANNER */}
            <div className="w-full flex flex-col gap-2">
                <div className={'mb-1 py-4'}>
                    <h2 className={isAudition ? 'text-xl md:text-2xl font-black' : 'text-2xl md:text-4xl font-bold'}>
                        Gate Operations
                    </h2>
                    <div className={'flex items-center gap-4 mt-2'}>
                        {ticketOperation ?
                            <div className={'flex items-center gap-4 mt-2'}>
                                <p className={'bg-amber-500 text-zinc-800 font-semibold p-2 px-4 text-sm mt-1 inline-flex rounded'}>{ticketOperation.split('-').join(' ').toUpperCase()}</p>
                                <button
                                    onClick={resetTicketOperationAction}
                                    className={'text-rose-100 hover:text-red-400 cursor-pointer'}>
                                    Cancel
                                </button>
                            </div>
                            :
                            <p className={'text-zinc-500'}>Choose an action to continue</p>}
                    </div>
                </div>

                <section>
                    {!ticketOperation ? (
                        <div className={'grid grid-cols-2 gap-2 w-full'}>
                            <NButton
                                className={`${isAudition ? 'py-6 text-sm' : 'py-10 text-lg'} bg-green-500 hover:bg-green-200 hover:text-green-900`}
                                icon={<UserCheck size={isAudition ? 18 : 24} />}
                                onClick={() => selectTicketOperationAction('check-in')}>
                                {isAudition ? "Check Applicant In" : "Check Fan In"}
                            </NButton>

                            <NButton
                                className={`${isAudition ? 'py-6 text-sm' : 'py-10 text-lg'} bg-rose-500 hover:bg-rose-200 hover:text-rose-900`}
                                icon={<UserMinus size={isAudition ? 18 : 24} />}
                                onClick={() => selectTicketOperationAction('check-out')}>
                                {isAudition ? "Check Applicant Out" : "Check Fan Out"}
                            </NButton>

                            {/* <NButton
                                className={'py-10 bg-amber-500 hover:bg-amber-200 hover:text-amber-900 text-lg'}
                                icon={<QrCode />}
                                onClick={() => selectTicketOperationAction('scan')}>
                                Scan Ticket
                            </NButton>

                            <NButton
                                className={'py-10 bg-red-800 hover:bg-red-200 hover:text-red-900 text-lg'}
                                icon={<ShieldX />}
                                onClick={() => selectTicketOperationAction('suspend')}>
                                Suspend Ticket
                            </NButton> */}
                        </div>
                    ) : null}
                </section>

                <section className={'rounded-2xl overflow-hidden h-auto'}>
                    {ticketOperation && !openApprovalModalAction ? (
                        <div className="w-full flex justify-center py-4 relative">
                            <div className="w-[80%] aspect-square rounded-2xl overflow-hidden border-4 border-orange-500/30 shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)] relative">
                                {loading ? (
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 z-10">
                                        <Spinner />
                                        <p className="text-sm font-bold text-zinc-400">Verifying...</p>
                                    </div>
                                ) : null}
                                <Scanner
                                    onScan={handleScanAction}
                                    onError={(error: any) => console.log(error?.message)}
                                    styles={{
                                        container: { width: '100%', height: '100%' }
                                    }}
                                />
                            </div>
                        </div>
                    ) : null}
                </section>
            </div>
            <Dialog open={openApprovalModalAction} onOpenChange={(open) => {
                if (!open) {
                    cleanupDialogStateAction()
                }
                updateOpenApprovalModalAction(open)
            }}>
                <DialogContent className={'bg-zinc-950/95 backdrop-blur-xl text-white border border-zinc-800/50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] max-w-lg'}>
                    <DialogHeader>
                        <DialogTitle className={'text-xl font-black text-white uppercase tracking-wider flex items-center gap-2'}>
                            <QrCode className="text-orange-500" size={24} />
                            {isAudition ? "Audition Verification" : "Ticket Verification"}
                        </DialogTitle>
                    </DialogHeader>

                    <section className='flex flex-col gap-6 py-4'>
                        {/* Error State */}
                        {scanError ? (
                            <div className="flex flex-col items-center justify-center space-y-6">
                                <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                                    <MdReport size={48} className="text-red-500" />
                                </div>

                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-bold text-white">{scanError.title}</h3>
                                    <p className="text-zinc-400 max-w-xs mx-auto">{scanError.message}</p>
                                    {scanError.suggestion && (
                                        <p className="text-sm text-zinc-500 bg-zinc-900/50 p-3 rounded-lg border border-white/5 mt-4">
                                            💡 {scanError.suggestion}
                                        </p>
                                    )}
                                </div>

                                {/* Show Ticket Details even on Error if available */}
                                {(scanError.ticket || currentTicket) && (
                                    <div className="w-full bg-zinc-900/30 border border-white/5 rounded-2xl p-4 mt-4 opacity-75">
                                        <div className="flex justify-center mb-4">
                                            <div className='flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl'>
                                                <MdReport size={20} />
                                                <span className="font-bold">Failed to Check In/Out</span>
                                            </div>
                                        </div>

                                        {/* Ticket Info */}
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                            <div className='flex flex-col items-center gap-1'>
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Stand</span>
                                                <span className='text-zinc-300 font-bold'>{(scanError.ticket || currentTicket).stand || 'General'}</span>
                                            </div>
                                            <div className='flex flex-col items-center gap-1'>
                                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Holder</span>
                                                <span className='text-zinc-300 font-bold text-center'>
                                                    {(scanError.ticket || currentTicket).createdBy?.firstName
                                                        ? `${(scanError.ticket || currentTicket).createdBy.firstName} ${(scanError.ticket || currentTicket).createdBy.lastName || ''}`
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3 w-full pt-4">
                                    <button
                                        onClick={onResetError}
                                        className="col-span-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors"
                                    >
                                        Close
                                    </button>
                                    {scanError.canVoid && (
                                        <button
                                            onClick={() => {
                                                handleBlockingTicketAction();
                                                onResetError?.();
                                            }}
                                            className="col-span-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors"
                                        >
                                            Void Ticket
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : loading && !currentTicket ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-6">
                                {/* Animated QR Scanner Icon */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl animate-pulse"></div>
                                    <QrCode className="relative text-orange-500 animate-pulse" size={80} />
                                </div>

                                {/* Scanning Text */}
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-bold text-white">Processing Ticket...</h3>
                                    <p className="text-zinc-400">Please wait while we verify the ticket</p>
                                </div>

                                {/* Loading Bars */}
                                <div className="w-64 space-y-2">
                                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Validation Badge */}
                                <div className="flex justify-center">
                                    {(selectedEvent && currentTicket) && selectedEvent.toString() === (currentTicket.event?._id || currentTicket.event)?.toString() ? (
                                        <div className='flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/30 px-6 py-3 rounded-2xl'>
                                            <RiVerifiedBadgeFill size={28} />
                                            <span className="font-bold text-lg">Valid {isAudition ? "Application" : "Ticket"}</span>
                                        </div>
                                    ) : (
                                        <div className='flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 px-6 py-3 rounded-2xl'>
                                            <MdReport size={28} />
                                            <span className="font-bold text-lg">Event Mismatch</span>
                                        </div>
                                    )}
                                </div>

                                {/* Event Information - Conditional based on event type */}
                                {currentTicket && (
                                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
                                        {/* Event Title/Match */}
                                        {currentTicket.event?.homeTeam && currentTicket.event?.awayTeam ? (
                                            <div className="text-center">
                                                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Football Match</p>
                                                <div className='flex items-center justify-center gap-3 text-2xl font-bold'>
                                                    <span className='text-orange-400'>{(currentTicket.event.homeTeam as any)?.name ?? currentTicket.event.homeTeam}</span>
                                                    <span className="text-zinc-600">vs</span>
                                                    <span className='text-orange-400'>{(currentTicket.event.awayTeam as any)?.name ?? currentTicket.event.awayTeam}</span>
                                                </div>
                                            </div>
                                        ) : currentTicket.event?.title ? (
                                            <div className="text-center">
                                                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Event</p>
                                                <h3 className="text-2xl font-bold text-orange-400">{currentTicket.event.title}</h3>
                                            </div>
                                        ) : null}

                                        {/* Ticket Status Badge */}
                                        <div className='flex justify-center'>
                                            <div className={`${statusBadgeStyle(computedStatus)} px-4 py-2 rounded-xl font-bold uppercase tracking-wide text-sm`}>
                                                {computedStatus ?? "Unknown"}
                                            </div>
                                        </div>

                                        {/* Ticket Details */}
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                            {/* Bio Data / Picture for Audition */}
                                            {isAudition && (currentTicket as any).applicantPicture && (
                                                <div className="col-span-2 flex justify-center mb-4">
                                                    <div className="h-40 w-40 rounded-2xl overflow-hidden border-2 border-orange-500/30">
                                                        <img
                                                            src={(currentTicket as any).applicantPicture}
                                                            alt="Applicant"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Stand/Section */}
                                            <div className='flex flex-col items-center gap-2 bg-zinc-800/50 p-3 rounded-xl'>
                                                <MdStadium size={24} className="text-orange-500" />
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider">{isAudition ? "Category" : "Stand"}</span>
                                                <span className='text-white font-bold'>{currentTicket.stand || 'General'}</span>
                                            </div>

                                            {/* Ticket Holder */}
                                            <div className='flex flex-col items-center gap-2 bg-zinc-800/50 p-3 rounded-xl'>
                                                <User2Icon size={24} className="text-orange-500" />
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider">{isAudition ? "Applicant" : "Holder"}</span>
                                                <span className='text-white font-bold text-center'>
                                                    {currentTicket?.createdBy?.firstName && currentTicket?.createdBy?.lastName
                                                        ? `${currentTicket.createdBy.firstName} ${currentTicket.createdBy.lastName}`
                                                        : currentTicket?.createdBy?.firstName || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* View Audition Answers Button */}
                                        {isAudition && (currentTicket as any).formAnswers?.length > 0 && (
                                            <div className="pt-4">
                                                <Button
                                                    onClick={() => setShowAnswers(!showAnswers)}
                                                    variant="outline"
                                                    className="w-full border-zinc-800 text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    {showAnswers ? "Hide Form Answers" : "View Audition Answers"}
                                                </Button>

                                                {showAnswers && (
                                                    <div className="mt-4 space-y-4 bg-black/40 p-4 rounded-xl border border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        {(currentTicket as any).formAnswers.map((ans: any, idx: number) => (
                                                            <div key={idx} className="space-y-1">
                                                                <p className="text-[9px] font-black uppercase text-zinc-600 tracking-wider">{ans.fieldLabel}</p>
                                                                <p className="text-sm text-zinc-300 font-medium">{ans.answer || "N/A"}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="pt-4">
                                            {!isTeamManager && (
                                                ticketOperation === 'check-in' ? (
                                                    <PreCheckInActions
                                                        loading={loading}
                                                        eventMismatch={selectedEvent.toString() !== (currentTicket.event?._id || currentTicket.event)?.toString()}
                                                        handleCheckingUserIn={handleCheckingUserInAction}
                                                        handleBlockingTicket={handleBlockingTicketAction}
                                                    />
                                                ) : (
                                                    <PostCheckInActions
                                                        loading={loading}
                                                        eventMismatch={selectedEvent.toString() !== (currentTicket.event?._id || currentTicket.event)?.toString()}
                                                        handleCheckingUserOut={handleCheckingUserOutAction}
                                                        handleBlockingTicket={handleBlockingTicketAction}
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}



                                {/* Loading State */}
                                {loading && <TicketOperationStatus ticketOperation={ticketOperation} />}
                            </>
                        )}
                    </section>
                </DialogContent>
            </Dialog>
        </section>
    )
}