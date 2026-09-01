"use client"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCheckIcon, CheckCircle, CheckIcon, CircleMinus, CirclePlus, Crown, Ticket, Users } from "lucide-react"
import { Card } from "../ui/card"
import { ChangeEvent, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { sanitizeTicketValue, STAND_TYPE } from "@/lib/utils"
// import PayNow from "./pay-now"
import ConfirmTicketPurchase from "./confirm-purchase"
import BuyTicket from "./buy-ticket"
import { OnPayNow, OnFreeOrder } from "@/lib/helpers";
import { useApp } from "@/context/AppContext";

export function BookRegularEventModal({ event }: { event: any }) {
    const [selectedTicketType, setSelectedTicketType] = useState(2)
    const [maxTickets, setMaxTickets] = useState(400)

    // Construct ticket types dynamically
    const ticketTypes = event.ticketTypes?.map((t: any, idx: number) => ({
        id: idx + 1,
        name: t.name,
        price: Number(t.price || 0),
        icon: idx === 1 ? Crown : Ticket,
        color: idx === 0 ? "text-blue-500" : idx === 1 ? "text-yellow-500" : "text-orange-500",
        max: 500
    })) || []

    const [payNowLoading, setPayNowLoading] = useState(false)
    const { user } = useApp()
    const [ticketQty, setTicketQty] = useState<Record<string, number>>({});

    const [ticketsToPurchase, setTicketsToPurchase] = useState(
        [...ticketTypes].map(ticket => ({ id: ticket.id, name: ticket.name, price: ticket.price, quantity: 0 }))
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


    const updateTicketQty = ({ name, max, id, delta }: { id: number, delta: number, name: string; max: number }) => {
        setTicketsToPurchase((_ticketsToPurchase) => {
            return _ticketsToPurchase.map((ticket) => {
                if (ticket.id !== id) return ticket // leave others unchanged

                const newQty = Math.max(0, Math.min(ticket.quantity + delta, max))

                if (newQty === ticket.quantity) {
                    if (newQty === max)
                        toast.error(`You can't buy more than ${max.toLocaleString()} tickets for ${name}`)
                    return ticket
                }
                return { ...ticket, quantity: newQty }
            })
        });
    };

    const onQtyInputChange = (e: ChangeEvent<HTMLInputElement>, { id, name, price, max }: {
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

        if (totalTickets > maxTickets) {
            toast.info(`You can't buy more than ${maxTickets} tickets`);
        }

        setTicketsToPurchase((prev) => {
            const exists = prev.find((t) => t.id === id);

            if (exists) {
                // update existing ticket
                return prev.map((t) =>
                    t.id === id ? { ...t, quantity: numericValue } : t
                );
            } else {
                // add new ticket
                return [...prev, { id, name, price, quantity: numericValue }];
            }
        });
    }

    const handleOnBuyTicket = async () => {
        if (!user) {
            toast.error("Please login to buy tickets");
            window.location.assign('/auth/login');
            return;
        }
        const paymentPayload = {
            email: user?.email,
            amount: totalPrice,
            eventId: event._id
        }
        if (totalTickets > 1) {
            setModalState(1)
        } else {
            setPayNowLoading(true)
            try {
                if (totalPrice === 0) {
                    const result = await OnFreeOrder(ticketsToPurchase, event._id)
                    if (result.success) {
                        toast.success('Tickets generated successfully!')
                        setTimeout(() => window.location.assign('/u/tickets'), 1500)
                    }
                } else {
                    await OnPayNow(paymentPayload, ticketsToPurchase, event._id)
                }
            } catch (error: any) {
                console.error("Error creating ticket:", error)
                toast.error(error.message || "Failed to process order. Please try again.")
            } finally {
                setPayNowLoading(false)
            }
        }
    }

    const redirectToPayNowModal = () => {
        // console.log('Paying now...')
        // setModalState(2)
    }

    return (
        <DialogContent className="sm:max-w-[650px] w-[95vw] bg-card text-card-foreground border-border rounded-sm shadow-2xl p-6 sm:p-8 overflow-hidden">
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
                    eventId={event._id}
                    redirectToPayNow={redirectToPayNowModal}
                    ticketsToPurchase={ticketsToPurchase}
                    totalPrice={totalPrice}
                />
            ) : null}
        </DialogContent>
    )
}
