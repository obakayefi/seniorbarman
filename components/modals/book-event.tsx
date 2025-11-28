"use client"
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {CheckCheckIcon, CheckCircle, CheckIcon, CircleMinus, CirclePlus, Crown, Ticket, Users} from "lucide-react"
import {Card} from "../ui/card"
import {ChangeEvent, useEffect, useMemo, useState} from "react"
import {toast} from "sonner"
import {sanitizeTicketValue, STAND_TYPE} from "@/lib/utils"
import PayNow from "./pay-now"
import ConfirmTicketPurchase from "./confirm-purchase"
import BuyTicket from "./buy-ticket"
import {OnPayNow} from "@/lib/helpers";
import {useApp} from "@/context/AppContext";

export function BookEventModal({eventId}: { eventId: string }) {
    const [selectedTicketType, setSelectedTicketType] = useState(2)
    const ticketTypes = [
        {id: 432, name: "Popular Stand", icon: Users, price: 500, color: "text-red-500", max: 22000},
        {id: 521, name: "Cover Stand Regular", icon: Ticket, price: 2000, color: "text-blue-500", max: 2000},
        {id: 251, name: "Cover Stand Executive", price: 10000, icon: Crown, color: "text-yellow-500", max: 50},
    ]
    const [payNowLoading, setPayNowLoading] = useState(false)
    const {user} = useApp()
    const [ticketQty, setTicketQty] = useState<Record<string, number>>({});

    const [ticketsToPurchase, setTicketsToPurchase] = useState(
        [...ticketTypes].map(ticket => ({id: ticket.id, name: ticket.name, price: ticket.price, quantity: 0}))
    )
    const [modalState, setModalState] = useState(0)

    const resetForm = () => {
        setTimeout(() => setModalState(0), 1000)
    }

    const totalTickets = ticketsToPurchase.reduce((sum, t) => sum + t.quantity, 0)

    const goBack = () => setModalState(state => {
        if (totalTickets > 1)
            return state - 1
        else
            return state - 2
    })

    const totalPrice = useMemo(() =>
            ticketsToPurchase.reduce((total, t) => total + t.price * t.quantity, 0)
        , [ticketsToPurchase])

    // const totalTickets = useMemo(() => {
    //     ticketsToPurchase.reduce((total, t) => total + t.quantity, 0)
    // }, [ticketsToPurchase])


    const updateTicketQty = ({name, max, id, delta}: { id: number, delta: number, name: string; max: number }) => {
        setTicketsToPurchase((_ticketsToPurchase) => {
            return _ticketsToPurchase.map((ticket) => {
                if (ticket.id !== id) return ticket // leave others unchanged

                const newQty = Math.max(0, Math.min(ticket.quantity + delta, max))

                if (newQty === ticket.quantity) {
                    if (newQty === max)
                        toast.error(`You can't buy more than ${max.toLocaleString()} tickets for ${name}`)
                    return ticket
                }
                return {...ticket, quantity: newQty}
            })
        });
    };

    const onQtyInputChange = (e: ChangeEvent<HTMLInputElement>, {id, name, price, max}: {
        id: number;
        name: string;
        price: number;
        max: number
    }) => {
        const inputValue = e.target.value
        const numericValue = sanitizeTicketValue(inputValue, max)

        if (Number(inputValue) > max) {
            toast.info(`You can't buy more than ${max.toLocaleString()} tickets for the ${name}`);
        }

        setTicketsToPurchase((prev) => {
            const exists = prev.find((t) => t.id === id);

            if (exists) {
                // update existing ticket
                return prev.map((t) =>
                    t.id === id ? {...t, quantity: numericValue} : t
                );
            } else {
                // add new ticket
                return [...prev, {id, name, price, quantity: numericValue}];
            }
        });
    }

    const handleOnBuyTicket = async () => {
        const paymentPayload = {
            email: user?.email,
            amount: totalPrice,
            eventId
        }
        if (totalTickets > 1) {
            setModalState(2)
        } else {
            setPayNowLoading(true)
            await OnPayNow(paymentPayload, ticketsToPurchase, eventId)
            setPayNowLoading(false)
        }
    }

    const redirectToPayNowModal = () => {
        console.log('Paying now...')
        // setModalState(2)
    }

    return (
        <div>
            <form>
                <DialogContent className="sm:max-w-[750px] w-4/5  h-full md:h-auto m-4  overflow-auto">
                    {modalState === 0 ? (
                        <BuyTicket
                            ticketsToPurchase={ticketsToPurchase} 
                            loading={payNowLoading}
                            totalTickets={totalTickets}
                            updateTicketQty={updateTicketQty}
                            handleOnBuyTicket={handleOnBuyTicket}
                            onQtyInputChange={onQtyInputChange}
                            resetForm={resetForm}
                            totalPrice={totalPrice}
                            ticketTypes={ticketTypes}
                        />
                    ) : modalState === 1 ? (
                        <ConfirmTicketPurchase
                            goBack={goBack}
                            eventId={eventId}
                            redirectToPayNow={redirectToPayNowModal}
                            ticketsToPurchase={ticketsToPurchase}
                            totalPrice={totalPrice}
                        />
                    ) : modalState === 2 ? (
                        <PayNow
                            goBack={goBack}
                            eventId={eventId}
                            ticketsToPurchase={ticketsToPurchase}
                        />
                    ) : null}
                </DialogContent>
            </form>
        </div>
    )
}
