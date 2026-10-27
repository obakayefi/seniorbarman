
import React, { useEffect, useState } from 'react'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { CheckCircle } from 'lucide-react'
import useUser from '@/hooks/useUser'
import api from '@/lib/axios'
import { useApp } from '@/context/AppContext'
import NButton from '../native/NButton'
import { OnPayNow, OnFreeOrder } from "@/lib/helpers";
import { getUserFromCookie } from "@/lib/auth";
import { toast } from "sonner";

type Props = {
    ticketsToPurchase: any[];
    totalPrice: number;
    goBack: () => void;
    redirectToPayNow: () => void;
    eventId: string;
}


const ConfirmTicketPurchase = ({ ticketsToPurchase, totalPrice, goBack, eventId }: Props) => {
    const [loading, setLoading] = useState(false)
    const { user, loading: userLoading } = useApp()
    const [maxTickets, setMaxTickets] = useState(400)

    const paymentPayload = {
        email: user?.email,
        amount: totalPrice,
        eventId
    }
    //
    // useEffect(() => {
    //     console.log({ ticketsToPurchase, eventId, userId: user?.id })
    // }, [])

    const payNow = async () => {
        setLoading(true)
        try {
            const totalTickets = ticketsToPurchase.reduce(
                (sum, ticket) => sum + ticket.quantity,
                0
            );

            if (totalTickets > maxTickets) {
                toast.error(`You can\'t buy more than ${maxTickets} tickets`)
                return
            }

            if (totalPrice === 0) {
                const result = await OnFreeOrder(ticketsToPurchase, eventId)
                if (result.success) {
                    toast.success('Tickets generated successfully!')
                    setTimeout(() => window.location.assign('/u/tickets'), 1500)
                }
            } else {
                await OnPayNow(paymentPayload, ticketsToPurchase, eventId)
            }
        } catch (error: any) {
            console.error('Error making payment', error.message)
            toast.error('Failed to process order. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full flex flex-col">
            <DialogHeader className="mb-4 text-left">
                <div>
                    <DialogTitle className="text-2xl font-extrabold uppercase text-foreground">Confirm Ticket Purchase</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
                        Verify the quantities and total before proceeding.
                    </DialogDescription>
                </div>
                <div className="flex flex-col mt-4 gap-3">
                    {ticketsToPurchase.map(ticket => {
                        if (ticket.quantity === 0) return null
                        return (
                            <section key={ticket.id} className="border-b border-border pb-2.5">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                                    <h5 className="font-bold text-foreground text-sm uppercase">{ticket.name}</h5>
                                    <p className="text-base font-extrabold text-orange-500">
                                        ₦{(ticket.price * ticket.quantity).toLocaleString()} <span className="text-muted-foreground text-xs font-normal">({ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''})</span>
                                    </p>
                                </div>
                            </section>
                        )
                    })}
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-bold text-muted-foreground uppercase">Total Amount</span>
                        <span className="text-2xl font-black text-foreground">₦{totalPrice.toLocaleString()}</span>
                    </div>
                </div>
            </DialogHeader>

            <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border mt-4">
                <Button variant="ghost" className="h-10 px-5 rounded-sm text-muted-foreground hover:text-foreground font-bold uppercase tracking-wider text-xs w-full sm:w-auto" onClick={goBack}>
                    Go back
                </Button>
                <NButton
                    onClick={payNow}
                    disabled={loading}
                    loading={loading}
                    className="h-10 px-7 rounded-sm bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-wider text-xs w-full sm:w-auto shadow-md shadow-orange-500/20"
                >
                    {totalPrice === 0 ? 'Get Tickets' : 'Pay Now'}
                </NButton>
            </DialogFooter>
        </div>
    )
}

export default ConfirmTicketPurchase