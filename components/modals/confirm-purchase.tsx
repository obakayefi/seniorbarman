import React, { useEffect, useState } from 'react'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { CheckCircle } from 'lucide-react'
import useUser from '@/hooks/useUser'
import api from '@/lib/axios'
import { useApp } from '@/context/AppContext'
import NButton from '../native/NButton'

type Props = {
    ticketsToPurchase: any[];
    totalPrice: number;
    goBack: () => void;
    redirectToPayNow: () => void;
    eventId: string;
}

export const OnPayNow = async (payload: {}, ticketsToPrint: any[], eventId: string) => {
    // setLoading(true)
    // try {
    const result = await api.post("/payment", payload, { withCredentials: true })
    console.log({ result: result.data })
    const paymentUrl = result.data.redirectTo
    console.log({ paymentUrl });
    const flattenedOrder = ticketsToPrint.filter(ticket => ticket.quantity > 0)
    const orderPayload = { tickets: flattenedOrder, eventId, reference: result.data.reference, isGenerated: false }
    const savedTicketOrder = await api.post('/ticket-order', orderPayload)
    console.log({ orderPayload, response: savedTicketOrder })
    setTimeout(() => window.location.assign(paymentUrl), 1000)
}

const ConfirmTicketPurchase = ({ ticketsToPurchase, totalPrice, goBack, eventId }: Props) => {
    const [loading, setLoading] = useState(false)
    const { user, loading: userLoading } = useApp()

    const paymentPayload = {
        email: user?.email,
        amount: totalPrice,
        eventId
    }

    useEffect(() => {
        console.log({ ticketsToPurchase, eventId, userId: user?.id })
    }, [])

    const payNow = async () => {
        setLoading(true)
        try {
            await OnPayNow(paymentPayload, ticketsToPurchase, eventId)
        } catch (error: any) {
            console.error('Error making payment', error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <DialogHeader>
                <div>
                    <DialogTitle className="text-2xl text-orange-400">Confirm Ticket Purchase</DialogTitle>
                    <DialogDescription>
                        Verify the quantities you want.
                    </DialogDescription>
                </div>
                <div className="flex gap-2 flex-col mt-5 justify-between">
                    {ticketsToPurchase.map(ticket => {
                        if (ticket.quantity === 0) return null
                        return (
                            <section className="">
                                <div className="flex justify-between">
                                    <h5>{ticket.name} <span className="text-sm text-gray-500">(₦{ticket.price.toLocaleString()})</span></h5> <p className="text-lg text-orange-500">₦{(ticket.price * ticket.quantity).toLocaleString()} <span className="text-slate-700 text-sm">{ticket.quantity} tickets</span> </p>
                                </div>
                            </section>
                        )
                    })}
                    <p>Total: <span className="text-2xl text-green-600">₦{totalPrice.toLocaleString()}</span></p>
                </div>


            </DialogHeader>
            <DialogFooter className='items-center flex justify-center'>
                {/* <DialogClose asChild > */}
                <Button variant="outline" onClick={goBack}>Go back</Button>
                {/* </DialogClose> */}
                <NButton
                    onClick={payNow}
                    disabled={loading}
                    icon={<CheckCircle />}
                    loading={loading}>
                    Pay Now
                </NButton>
            </DialogFooter>
        </>
    )
}

export default ConfirmTicketPurchase