
import React, { useEffect, useState } from 'react'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { CheckCircle } from 'lucide-react'
import useUser from '@/hooks/useUser'
import api from '@/lib/axios'
import { useApp } from '@/context/AppContext'
import NButton from '../native/NButton'
import {OnPayNow} from "@/lib/helpers";
import {getUserFromCookie} from "@/lib/auth";
import {toast} from "sonner";

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
            
            if (totalTickets > 5) {
                toast.error('You can\'t buy more than 5 tickets')
                return
            }
            
            await OnPayNow(paymentPayload, ticketsToPurchase, eventId)
        } catch (error: any) {
            console.error('Error making payment', error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={''}>
            <DialogHeader>
                <div>
                    <DialogTitle className="text-2xl text-orange-400">Confirm Ticket Purchase</DialogTitle>
                    <DialogDescription>
                        Verify the quantities you want.
                    </DialogDescription>
                </div>
                <div className="flex flex-col mt-5 gap-10 md:gap-3 justify-between">
                    {ticketsToPurchase.map(ticket => {
                        if (ticket.quantity === 0) return null
                        return (
                            <section className="border-b-2 border-zinc-950">
                                <div className="flex flex-col sm:flex-row justify-between">
                                    <h5>{ticket.name}
                                    </h5> 
                                    <p className="text-lg text-orange-500">
                                        ₦{(ticket.price * ticket.quantity).toLocaleString()} <span className="text-slate-400 text-sm">{ticket.quantity} ticket(s)</span> 
                                    </p>
                                </div>
                            </section>
                        )
                    })}
                    <p>Total: <span className="text-2xl text-green-600">₦{totalPrice.toLocaleString()}</span></p>
                </div>


            </DialogHeader>
            <DialogFooter className='items-center flex justify-center'>
                {/* <DialogClose asChild > */}
                <Button variant="outline" className={'text-zinc-800'} onClick={goBack}>Go back</Button>
                {/* </DialogClose> */}
                <NButton
                    onClick={payNow}
                    disabled={loading}
                    icon={<CheckCircle />}
                    loading={loading}>
                    Pay Now
                </NButton>
            </DialogFooter>
        </div>
    )
}

export default ConfirmTicketPurchase