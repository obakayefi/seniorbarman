"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Check, User, Calendar, Ticket, ArrowRight, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from '@/components/ui/spinner'

const VipWizard = () => {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [existingUser, setExistingUser] = useState<any>(null)
    const [newUser, setNewUser] = useState<any>(null)
    const [events, setEvents] = useState<any[]>([])
    const [selectedEvent, setSelectedEvent] = useState<any>(null)
    const [generatedTickets, setGeneratedTickets] = useState<any[]>([])

    // Form States
    const [userForm, setUserForm] = useState({
        email: "",
        firstName: "",
        lastName: "",
        password: ""
    })

    const [ticketForm, setTicketForm] = useState({
        type: "vip",
        quantity: 1,
        price: 0,
        stand: "VIP"
    })

    // Fetch events on mount
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/events')
                setEvents(res.data.events || [])
            } catch (error) {
                console.error("Failed to fetch events", error)
                toast.error("Could not load events")
            }
        }
        fetchEvents()
    }, [])

    // --- Actions ---

    const validateUserForm = () => {
        if (!userForm.email || !userForm.email.includes('@')) {
            toast.error("Invalid email address")
            return false
        }
        if (!userForm.firstName || userForm.firstName.length < 2) {
            toast.error("First name is required")
            return false
        }
        if (!userForm.lastName || userForm.lastName.length < 2) {
            toast.error("Last name is required")
            return false
        }
        return true
    }

    const checkOrCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateUserForm()) return

        setLoading(true)
        setExistingUser(null)
        setNewUser(null)

        try {
            // Find if user exists
            const usersRes = await api.get('/users')
            const foundUser = usersRes.data.users?.find((u: any) => u.email.toLowerCase() === userForm.email.toLowerCase())

            if (foundUser) {
                setExistingUser(foundUser)
                toast.success("Existing user selected")
                setStep(2)
                return
            }

            // Create new user
            const tempPassword = userForm.password || Math.random().toString(36).slice(-8) + "Aa1!"

            const registerRes = await api.post('/auth/register', {
                email: userForm.email,
                firstName: userForm.firstName,
                lastName: userForm.lastName,
                password: tempPassword
            })

            if (registerRes.data.success) {
                // Refresh to get ID
                const refreshUsers = await api.get('/users')
                const created = refreshUsers.data.users?.find((u: any) => u.email.toLowerCase() === userForm.email.toLowerCase())

                if (created) {
                    setNewUser({ ...created, tempPassword })
                    toast.success("New user created successfully!")
                    setStep(2)
                } else {
                    throw new Error("Created user but couldn't retrieve details")
                }
            }
        } catch (error: any) {
            console.error("User processing error", error)
            toast.error(error.response?.data?.error || "Failed to process user")
        } finally {
            setLoading(false)
        }
    }

    const validateTicketForm = () => {
        if (ticketForm.quantity <= 0) {
            toast.error("Quantity must be at least 1")
            return false
        }
        if (ticketForm.price < 0) {
            toast.error("Price cannot be negative")
            return false
        }
        return true
    }

    const handleGenerateTickets = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateTicketForm()) return
        if (!selectedEvent || (!existingUser && !newUser)) return

        setLoading(true)
        try {
            const targetUserId = existingUser?._id || newUser?._id

            const payload = {
                eventId: selectedEvent._id,
                quantity: ticketForm.quantity,
                type: ticketForm.type,
                price: ticketForm.price,
                stand: ticketForm.stand,
                holderName: `${existingUser?.firstName || newUser?.firstName} ${existingUser?.lastName || newUser?.lastName}`,
                targetUserId: targetUserId
            }

            const res = await api.post('/tickets/generate', payload)

            if (res.data.success) {
                setGeneratedTickets(res.data.tickets)
                setStep(4)
                toast.success("Tickets generated successfully!")
            }
        } catch (error: any) {
            console.error("Generation error", error)
            toast.error(error.response?.data?.error || "Failed to generate tickets")
        } finally {
            setLoading(false)
        }
    }

    // --- Render Helpers ---

    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`h-2 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-orange-500' : s < step ? 'w-2 bg-green-500' : 'w-2 bg-zinc-800'}`} />
            ))}
        </div>
    )

    return (
        <div className="w-full max-w-2xl mx-auto">
            <StepIndicator />

            <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-orange-500/10 rounded-xl">
                                    <User className="text-orange-500" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Target User</h2>
                                    <p className="text-zinc-500 text-sm">Who are these tickets for?</p>
                                </div>
                            </div>

                            <form onSubmit={checkOrCreateUser} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>First Name</Label>
                                        <Input
                                            value={userForm.firstName}
                                            onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                                            placeholder="John"
                                            className="bg-zinc-950 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Name</Label>
                                        <Input
                                            value={userForm.lastName}
                                            onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                                            placeholder="Doe"
                                            className="bg-zinc-950 border-white/10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input
                                        value={userForm.email}
                                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                        placeholder="john@example.com"
                                        type="email"
                                        className="bg-zinc-950 border-white/10"
                                    />
                                </div>

                                <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 mt-4">
                                    {loading ? <Spinner /> : "Next: Select Event"}
                                </Button>
                            </form>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                    <Calendar className="text-blue-500" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Select Event</h2>
                                    <p className="text-zinc-500 text-sm">Which event needs tickets?</p>
                                </div>
                            </div>

                            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                                {events.map(event => (
                                    <div
                                        key={event._id}
                                        onClick={() => {
                                            setSelectedEvent(event)
                                            setStep(3)
                                        }}
                                        className="p-4 rounded-xl border border-white/5 bg-zinc-950 hover:border-orange-500/50 cursor-pointer transition-all flex justify-between items-center group"
                                    >
                                        <div>
                                            <h4 className="font-bold text-white group-hover:text-orange-500 transition-colors">
                                                {event.title || (event.homeTeam ? `${event.homeTeam} vs ${event.awayTeam}` : 'Unnamed Event')}
                                            </h4>
                                            <p className="text-xs text-zinc-500">{new Date(event.date).toLocaleDateString()}</p>
                                        </div>
                                        <ArrowRight className="text-zinc-700 group-hover:text-orange-500" size={16} />
                                    </div>
                                ))}
                                {events.length === 0 && (
                                    <p className="text-center text-zinc-600 py-10">No upcoming events found.</p>
                                )}
                            </div>

                            <Button variant="ghost" onClick={() => setStep(1)} className="w-full text-zinc-500 hover:text-white">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-purple-500/10 rounded-xl">
                                    <Ticket className="text-purple-500" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Ticket Details</h2>
                                    <p className="text-zinc-500 text-sm">Configure the tickets to generate</p>
                                </div>
                            </div>

                            <div className="bg-zinc-950/50 p-4 rounded-xl border border-white/5 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">User:</span>
                                    <span className="text-white font-bold">{existingUser?.firstName || newUser?.firstName} {existingUser?.lastName || newUser?.lastName}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-zinc-500">Event:</span>
                                    <span className="text-white font-bold truncate max-w-[200px]">
                                        {selectedEvent?.title || (selectedEvent?.homeTeam ? `${selectedEvent?.homeTeam} vs ${selectedEvent?.awayTeam}` : 'Event')}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleGenerateTickets} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Ticket Type</Label>
                                    <Select
                                        value={ticketForm.type}
                                        onValueChange={(v) => setTicketForm({ ...ticketForm, type: v, stand: v.toUpperCase() })}
                                    >
                                        <SelectTrigger className="bg-zinc-950 border-white/10 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                            <SelectItem value="regular">Regular</SelectItem>
                                            <SelectItem value="vip">VIP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Quantity</Label>
                                        <Input
                                            type="number"
                                            value={ticketForm.quantity}
                                            onChange={(e) => setTicketForm({ ...ticketForm, quantity: parseInt(e.target.value) || 0 })}
                                            className="bg-zinc-950 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Override Price (₦)</Label>
                                        <Input
                                            type="number"
                                            value={ticketForm.price}
                                            onChange={(e) => setTicketForm({ ...ticketForm, price: parseInt(e.target.value) || 0 })}
                                            className="bg-zinc-950 border-white/10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Stand/Section (Optional)</Label>
                                    <Input
                                        value={ticketForm.stand}
                                        onChange={(e) => setTicketForm({ ...ticketForm, stand: e.target.value })}
                                        placeholder="VIP Section A"
                                        className="bg-zinc-950 border-white/10"
                                    />
                                </div>

                                <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 mt-4">
                                    {loading ? <Spinner /> : "Generate Tickets"}
                                </Button>

                                <Button type="button" variant="ghost" onClick={() => setStep(2)} className="w-full text-zinc-500 hover:text-white mt-2">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
                                </Button>
                            </form>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8 space-y-6"
                        >
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                                <Check className="text-green-500" size={40} />
                            </div>

                            <div>
                                <h2 className="text-2xl font-black text-white">Success!</h2>
                                <p className="text-zinc-500">Tickets have been generated and assigned.</p>
                            </div>

                            {newUser?.tempPassword && (
                                <div className="bg-zinc-950 p-4 rounded-xl border border-orange-500/20 text-left">
                                    <p className="text-xs text-orange-500 font-bold uppercase tracking-widest mb-2">New Account Created</p>
                                    <p className="text-zinc-400 text-sm mb-1">Share these credentials with the user:</p>
                                    <div className="space-y-1 font-mono text-sm shadow-inner p-2 bg-black/20 rounded">
                                        <p><span className="text-zinc-600">Email:</span> <span className="text-white">{newUser.email}</span></p>
                                        <p><span className="text-zinc-600">Password:</span> <span className="text-white select-all">{newUser.tempPassword}</span></p>
                                    </div>
                                </div>
                            )}

                            <Button onClick={() => window.location.reload()} variant="outline" className="w-full border-zinc-700">
                                Start Over
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default VipWizard
