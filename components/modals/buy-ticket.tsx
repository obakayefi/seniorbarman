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
        <section className='bg-transparent overflow-y-auto max-h-[70vh] custom-scrollbar'>
            <DialogHeader className="mb-8">
                <div className="space-y-2">
                    <DialogTitle className="text-3xl font-black tracking-tighter text-white uppercase italic">
                        Select Your <span className="text-orange-500">Tickets</span>
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 font-medium">
                        Secure your spot for this premium experience. <span className='text-orange-500/50 font-bold'>(Max 5 tickets per order)</span>
                    </DialogDescription>
                </div>
            </DialogHeader>

            <div className="space-y-4 mb-8">
                {ticketTypes.map(({ name, icon: Icon, color, price, max, id }, index) => {
                    const selected = ticketsToPurchase.find(t => t.id === id)
                    const quantity = selected?.quantity || 0
                    const isSelected = quantity > 0

                    return (
                        <div
                            key={id}
                            className={`group relative flex items-center justify-between p-5 rounded-3xl transition-all duration-500 border ${
                                isSelected 
                                ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.1)]' 
                                : 'bg-zinc-900/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/60'
                            }`}
                        >
                            <div className="flex items-center gap-5">
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${
                                    isSelected ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'
                                }`}>
                                    <Icon size={28} />
                                </div>
                                <div>
                                    <h4 className={`font-black uppercase tracking-wider text-sm transition-colors ${
                                        isSelected ? 'text-white' : 'text-zinc-400'
                                    }`}>
                                        {name}
                                    </h4>
                                    <p className={`text-2xl font-black mt-0.5 ${
                                        isSelected ? 'text-orange-500' : 'text-white'
                                    }`}>
                                        {price <= 0 ? "FREE" : `₦${price.toLocaleString()}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-1 gap-1">
                                <Button 
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all active:scale-90"
                                    onClick={() => updateTicketQty({ id, name, delta: -1, max })}
                                    disabled={quantity === 0}
                                >
                                    <CircleMinus size={20} />
                                </Button>

                                <div className="w-12 text-center">
                                    <input
                                        type="text"
                                        value={quantity}
                                        readOnly
                                        className="w-full bg-transparent text-xl font-black text-white text-center focus:outline-none"
                                    />
                                </div>

                                <Button 
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl hover:bg-orange-500/20 text-orange-500 transition-all active:scale-90"
                                    onClick={() => updateTicketQty({ id, name, delta: 1, max })}
                                    disabled={totalTickets >= 5}
                                >
                                    <CirclePlus size={20} />
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-white/5">
                <div className="flex-1 w-full sm:w-auto">
                    {totalTickets > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Estimated Total</p>
                            <p className="text-3xl font-black text-white italic">
                                ₦{ticketsToPurchase.reduce((sum, t) => sum + (t.price * t.quantity), 0).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <DialogClose asChild>
                        <Button 
                            variant="ghost" 
                            className="h-14 px-8 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-xs"
                            onClick={resetForm}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    
                    <NButton
                        loading={loading}
                        className={`h-14 px-10 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest transition-all ${
                            (!user || totalTickets === 0) ? 'opacity-50 grayscale' : 'hover:scale-[1.02] shadow-xl shadow-orange-600/20'
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
        </section>
    )
}
export default BuyTicket