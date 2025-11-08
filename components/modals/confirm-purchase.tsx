import React from 'react'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { CheckCircle } from 'lucide-react'

type Props = {
    ticketsToPurchase: any[];
    totalPrice: number;
    goBack: () => void;
    redirectToPayNow: () => void;
}

const ConfirmTicketPurchase = ({ticketsToPurchase, totalPrice, goBack, redirectToPayNow}: Props) => {
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
            <DialogFooter>
                {/* <DialogClose asChild > */}
                <Button variant="outline" onClick={goBack}>Go back</Button>
                {/* </DialogClose> */}
                <Button type="submit" onClick={redirectToPayNow}>Confirm Purchases <CheckCircle /></Button>
            </DialogFooter>
        </>
    )
}

export default ConfirmTicketPurchase