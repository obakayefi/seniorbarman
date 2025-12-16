import React, { useEffect, useState } from 'react'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { CheckCircle } from 'lucide-react'
import api from '@/lib/axios'
import { Spinner } from '../ui/spinner'
import { toast } from 'sonner'

type Props = {
    goBack: () => void;
    ticketsToPurchase: {}[]
    eventId: string;
}

const PayNow = ({ goBack, ticketsToPurchase, eventId }: Props) => {
    const [loading, setLoading] = useState(false)

    const createTicket = async () => {
        try {
            setLoading(true)
            const result = await api.post("/tickets", { ticketsToPurchase, eventId })
            // console.log({ result })
            toast.success('Tickets purchased!')
            // setTimeout(() => setLoading(false), 3000)
        } catch (error: any) {
            console.log('Error creating ticket:', error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        // console.log({ ticketsToPurchase, eventId })
    }, [ticketsToPurchase])

    return (
        <>
            <DialogHeader>
                <div>
                    <DialogTitle className="text-2xl text-orange-400">Pay Now</DialogTitle>
                    <DialogDescription>
                        Confirm your payments and get your tickets.
                    </DialogDescription>
                </div>
                <div className="flex gap-2 flex-col mt-5 justify-between">
                    {/* {ticketsToPurchase.map(ticket => {
                                        if (ticket.quantity === 0) return null
                                        return (
                                            <section className="">
                                                <div className="flex justify-between">
                                                    <h5>{ticket.name} <span className="text-sm text-gray-500">(₦{ticket.price.toLocaleString()})</span></h5> <p className="text-lg text-orange-500">₦{(ticket.price * ticket.quantity).toLocaleString()} <span className="text-slate-700 text-sm">{ticket.quantity} tickets</span> </p>
                                                </div>
                                            </section>
                                        )
                                    })} */}
                    {/* <p>Total: <span className="text-2xl text-green-600">₦{totalPrice.toLocaleString()}</span></p> */}
                </div>


            </DialogHeader>
            <DialogFooter>
                {/* <DialogClose asChild > */}
                <Button variant="outline" onClick={goBack}>Go back</Button>
                {/* </DialogClose> */}
                <Button
                    type="submit"
                    className='disabled:bg-slate-800 disabled:cursor-not-allowed cursor-pointer'
                    disabled={loading}
                    onClick={createTicket}>
                    Confirm Purchases {loading ? <Spinner /> : <CheckCircle />}
                </Button>
            </DialogFooter>
        </>
    )
}

export default PayNow