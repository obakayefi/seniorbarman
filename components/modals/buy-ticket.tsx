"use client"
import React, { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation';
import { DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Card } from '../ui/card';
import { CircleMinus, CirclePlus } from 'lucide-react';
import { Input } from '../ui/input';
import { useApp } from "@/context/AppContext";
import NButton from "@/components/native/NButton";

type Props = {
    ticketTypes: any[];
    totalPrice: number;
    ticketsToPurchase: any[];
    updateTicketQty: ({ id, delta, name, max }: { id: number, name: string, delta: number, max: number }) => void;
    resetForm: () => void;
    totalTickets: number;
    loading: boolean;
    handleOnBuyTicket: () => void;
    onQtyInputChange: (e: ChangeEvent<HTMLInputElement>, { id, name, price, max }: {
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
    const { user } = useApp()
    return (
        <div className="w-full flex flex-col">
            <DialogHeader className="mb-5 sm:mb-6 text-left">
                <div className="space-y-1">
                    <DialogTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground uppercase">
                        Select Your <span className="text-orange-500">Tickets</span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs sm:text-sm font-medium">
                        Secure your spot for this experience. <span className="text-orange-500/80 font-bold">(Max 5 tickets per order)</span>
                    </DialogDescription>
                </div>
            </DialogHeader>

            <div className="flex flex-col gap-2.5 sm:gap-3 mb-6">
                {ticketTypes.map(({ name, icon: Icon, color, price, max, id }, index) => {
                    const selected = ticketsToPurchase.find(t => t.id === id)
                    const quantity = selected?.quantity || 0
                    const isSelected = quantity > 0

                    return (
                        <div
                            key={id}
                            className={`group relative flex items-center justify-between p-3 sm:p-4 rounded-sm transition-all duration-200 border ${isSelected
                                ? 'bg-orange-500/10 border-orange-500/50 shadow-sm'
                                : 'bg-muted/40 border-border hover:border-muted-foreground/30 hover:bg-muted/70'
                                }`}
                        >
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-sm flex items-center justify-center shrink-0 transition-transform ${isSelected ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground border border-border'
                                    }`}>
                                    <Icon size={22} />
                                </div>
                                <div className="min-w-0 truncate">
                                    <h4 className={`font-bold uppercase tracking-wider text-xs sm:text-sm truncate ${isSelected ? 'text-foreground' : 'text-muted-foreground'
                                        }`}>
                                        {name}
                                    </h4>
                                    <p className={`text-lg sm:text-xl font-extrabold mt-0.5 ${isSelected ? 'text-orange-500' : 'text-foreground'
                                        }`}>
                                        {price <= 0 ? "FREE" : `₦${price.toLocaleString()}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center bg-card border border-border rounded-sm p-0.5 gap-1 shrink-0">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
                                    onClick={() => updateTicketQty({ id, name, delta: -1, max })}
                                    disabled={quantity === 0}
                                >
                                    <CircleMinus size={18} />
                                </Button>

                                <div className="w-8 sm:w-10 text-center">
                                    <input
                                        type="text"
                                        value={quantity}
                                        readOnly
                                        className="w-full bg-transparent text-base sm:text-lg font-bold text-foreground text-center focus:outline-none"
                                    />
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-sm text-orange-500 hover:bg-orange-500/15 transition-all active:scale-95"
                                    onClick={() => updateTicketQty({ id, name, delta: 1, max })}
                                    disabled={totalTickets >= 5}
                                >
                                    <CirclePlus size={18} />
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row  items-center justify-between gap-4 pt-4 border-t border-border">
                <div className="w-full  justify-start sm:w-auto">
                    {totalTickets > 0 && (
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimated Total</p>
                            <p className="text-2xl sm:text-3xl font-black text-foreground">
                                ₦{ticketsToPurchase.reduce((sum, t) => sum + (t.price * t.quantity), 0).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <DialogClose asChild>
                        <Button
                            variant="ghost"
                            className="h-10 sm:h-11 px-5 rounded-sm text-muted-foreground hover:text-foreground font-bold uppercase tracking-wider text-xs"
                            onClick={resetForm}
                        >
                            Cancel
                        </Button>
                    </DialogClose>

                    <NButton
                        loading={loading}
                        className={`h-10 sm:h-11 px-7 rounded-sm bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-wider text-xs transition-all ${(!user || totalTickets === 0) ? 'opacity-50 grayscale' : 'shadow-md shadow-orange-500/20'
                            }`}
                        onClick={() => {
                            if (!user) {
                                window.location.assign('/auth/login');
                                return;
                            }
                            handleOnBuyTicket();
                        }}
                        disabled={(loading || (user && totalTickets < 1) || totalTickets > 5)}
                    >
                        {!user ? 'Login to Continue' : (totalTickets > 1) ? 'View Summary' : 'Secure Booking'}
                    </NButton>
                </div>
            </DialogFooter>
        </div>
    )
}
export default BuyTicket