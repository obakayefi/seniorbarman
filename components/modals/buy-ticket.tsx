"use client"
import React, {ChangeEvent, useState} from 'react'
import {DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog'
import {Button} from '../ui/button'
import {Card} from '../ui/card';
import {CircleMinus, CirclePlus} from 'lucide-react';
import {Input} from '../ui/input';
import {useApp} from "@/context/AppContext";
import NButton from "@/components/native/NButton";

type Props = {
    ticketTypes: any[];
    totalPrice: number;
    ticketsToPurchase: any[];
    updateTicketQty: ({id, delta, name, max}: { id: number, name: string, delta: number, max: number }) => void;
    resetForm: () => void;
    totalTickets: number;
    loading: boolean;
    handleOnBuyTicket: () => void;
    onQtyInputChange: (e: ChangeEvent<HTMLInputElement>, {id, name, price, max}: {
        id: number;
        name: string;
        price: number;
        max: number
    }) => void;
}

const BuyTicket = ({
                       ticketTypes,
                       ticketsToPurchase,
                       updateTicketQty,
                       onQtyInputChange,
                       loading,
                       resetForm,
                       totalTickets,
                       handleOnBuyTicket
                   }: Props) => {
    const {user} = useApp()
    return (
        <section className=''>
            <DialogHeader>
                <div>
                    <DialogTitle className="text-2xl text-orange-400">Buy Ticket</DialogTitle>
                    <DialogDescription>
                        Plan ahead for that match and reserve your spot.
                    </DialogDescription>
                </div>
                <div className="flex gap-2 mt-5 flex-col mb-6 md:flex-row justify-between">
                    {ticketTypes.reverse().map(({name, icon: Icon, color, price, max, id}, index) => {
                        const selected = ticketsToPurchase.find(t => t.id === id)
                        const quantity = selected?.quantity || 0
                        const total = quantity * price

                        return (
                            <Card
                                key={name}
                                className={`flex bg-gray-100 hover:bg-slate-200 duration-300 items-center gap-3 p-4`}>
                                <Icon className={`h-6 w-6 ${color}`}/>
                                <span className="font text-gray-600">{name}</span>
                                <span className="text-green-900">₦{price.toLocaleString()}</span>


                                <div className="flex items-center gap-2">
                                    {/* <Button className="bg
                                    -white text-orange-400" onClick={() => updateTicketQty({ name, qty: -1, max, price })}>x */}
                                    <Button className="bg-white text-orange-400 rounded"
                                            onClick={() => updateTicketQty({id, name, delta: -1, max})}>
                                        <CircleMinus/>
                                    </Button>

                                    <Input
                                        value={quantity}
                                        type="text"
                                        className="text-4xl appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        onChange={(e) => onQtyInputChange(e, {name, price, max, id})}

                                    />

                                    <Button className="bg-orange-400 text-white rounded"
                                            onClick={() => updateTicketQty({id, name, delta: 1, max})}>
                                        <CirclePlus/>
                                    </Button>
                                </div>

                                <div>
                                    ₦{(Number(total).toLocaleString())}
                                </div>

                                <div className="mt-4 text-gray-400">
                                    <span className="text-sm">Maxium of {max.toLocaleString()} tickets</span>
                                </div>
                            </Card>
                        )
                    })}
                </div>

            </DialogHeader>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" onClick={resetForm}>Cancel</Button>
                </DialogClose>
                <NButton
                    loading={loading}
                    className={`${totalTickets === 0 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    onClick={handleOnBuyTicket}
                    disabled={(loading || (totalTickets < 1))}>
                    {(totalTickets > 1) ? 'Purchase Summary' : 'Pay Now'}
                </NButton>
            </DialogFooter>
        </section>
    )
}
export default BuyTicket