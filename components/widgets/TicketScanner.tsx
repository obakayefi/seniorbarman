"use client"
import React, {SetStateAction} from 'react'
import NButton from "@/components/native/NButton";
import {Power, QrCode, ShieldX, User2Icon, UserCheck, UserMinus} from "lucide-react";
import {Scanner} from "@yudiel/react-qr-scanner";
import {extractTicketStatus, statusBadgeStyle} from "@/lib/utils";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {RiVerifiedBadgeFill} from "react-icons/ri";
import {MdReport, MdStadium} from "react-icons/md";
import {PostCheckInActions, PreCheckInActions, TicketOperationType} from "@/app/u/a/scanner/page";
import {Spinner} from "@/components/ui/spinner";
import {TicketOperationStatus} from "@/components/ui/ticket-operation-status";


type TicketSummary = {
    event: {
        homeTeam: string;
        awayTeam: string;
    };
    user: string;
    ticket: {
        status: string;
        id: string;
        stand: string;
    }
}


type PreCheckInActionsProps = {
    loading: boolean;
    handleCheckingUserIn: () => void;
    eventMismatch: boolean;
}

type Props = {
    canScan: boolean;
    handleScanAction: (detectedCodes: any) => Promise<void>;
    toggleScanModeAction: () => void;
    openApprovalModalAction: boolean;
    updateOpenApprovalModalAction: React.Dispatch<SetStateAction<boolean>>;
    computedStatus: string;
    currentTicket: TicketSummary;
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
                                      }: Props) {


    return (
        <section
            className='md:border-2 bg-transparent md:bg-zinc-900 rounded-lg mt-1 p-8 py-0 flex items-center justify-center overflow-hidden h-auto   border-zinc-900 w-4/6'>
            {/* DESKTOP SCANNER */}
            <div className="w-full  hidden md:flex flex-col gap-2">
                <div className={'mb-1'}>
                    <h2 className={'text-4xl'}>Ticket Operations</h2>
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
                                className={'py-10 bg-green-500 hover:bg-green-200 hover:text-green-900 text-lg'}
                                icon={<UserCheck/>}
                                onClick={() => selectTicketOperationAction('check-in')}>
                                Check Fan In
                            </NButton>

                            <NButton
                                className={'py-10 bg-rose-500 hover:bg-rose-200 hover:text-rose-900 text-lg'}
                                icon={<UserMinus/>}
                                onClick={() => selectTicketOperationAction('check-out')}>
                                Check Fan Out
                            </NButton>

                            <NButton
                                className={'py-10 bg-amber-500 hover:bg-amber-200 hover:text-amber-900 text-lg'}
                                icon={<QrCode/>}
                                onClick={() => selectTicketOperationAction('scan')}>
                                Scan Ticket
                            </NButton>

                            <NButton
                                className={'py-10 bg-red-800 hover:bg-red-200 hover:text-red-900 text-lg'}
                                icon={<ShieldX/>}
                                onClick={() => selectTicketOperationAction('suspend')}>
                                Suspend Ticket
                            </NButton>
                        </div>
                    ) : null}
                </section>

                <section className={'rounded-lg overflow-hidden h-auto'}>
                    {ticketOperation ? (
                        <Scanner
                            onScan={handleScanAction}
                            onError={(error: any) => console.log(error?.message)}
                        />
                    ) : null}
                </section>
            </div>
            <Dialog open={openApprovalModalAction} onOpenChange={(open) => {
                if (!open) {
                    cleanupDialogStateAction()
                }
                updateOpenApprovalModalAction(open)
            }}>
                <DialogContent className={'bg-zinc-900 text-white border-zinc-800'}>
                    <DialogHeader>
                        <DialogTitle className={'text-zinc-500'}>Ticket Information</DialogTitle>
                    </DialogHeader>
                    {/*<DialogDescription className='flex flex-col gap-2 justify-between'>*/}
                    <section className='flex flex-col gap-2 justify-between'>
                        <section className='flex flex-col gap-2'>
                            {(selectedEvent && currentTicket) && selectedEvent === currentTicket.event?._id ? (
                                <div className='flex items-center gap-1 text-green-500'>
                                    <span>Valid</span>
                                    <RiVerifiedBadgeFill size={24} className='mb-0.5'/>
                                </div>
                            ) : (
                                <div className='flex items-center gap-1 text-red-500'>
                                    <h4 className='m-0'>Event Mismatch</h4>
                                    <MdReport size={24}/>
                                </div>
                            )}

                            <div className='flex flex-col items-start gap-1'>
                                <div className={`${statusBadgeStyle(computedStatus)} p-1 px-2 rounded`}>
                                    {computedStatus ?? "Ah!"}
                                </div>
                            </div>

                            <div className='flex items-center gap-1'>
                                            <span
                                                className='text-lg text-slate-200'>{currentTicket.event?.homeTeam}</span>
                                <span>vs</span>
                                <span
                                    className='text-lg text-slate-200'>{currentTicket.event?.awayTeam}</span>
                            </div>
                        </section>
                    </section>
                    {/*</DialogDescription>*/}

                    <section className='flex items-center w-full justify-between'>
                        <div className={'flex items-center text-slate-600 gap-1'}>
                            <h5 className='text-sm text-slate-300'>{currentTicket.stand}</h5>
                            <span>
                                            <MdStadium size={21}/>
                                        </span>

                        </div>

                        <div
                            className='text-slate-300 px-2 py-1 rounded text-sm flex items-center justify-center gap-1 bg-slate-800 w-max-fit'>
                                        <span
                                            className='flex items-center gap-1'>{`${currentTicket?.createdBy?.firstName}`}</span>
                            <span
                                className='mb-0.5'><User2Icon size={16}/></span>
                        </div>
                    </section>

                    {loading &&  <TicketOperationStatus ticketOperation={ticketOperation} />}
                    
                </DialogContent>
            </Dialog>
        </section>
    )
}