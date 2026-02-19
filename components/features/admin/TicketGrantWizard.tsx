"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
    Loader2, UserPlus, Search, Ticket, CheckCircle2,
    ArrowRight, ArrowLeft, User, Mail, Lock, Hash
} from "lucide-react"
import api from "@/lib/axios"
import TicketCarousel from "@/app/u/tickets/[id]/TicketCarousel"

type WizardStep = 'user' | 'ticket' | 'review' | 'success'

interface UserData {
    _id: string
    firstName: string
    lastName: string
    email: string
}

interface TicketConfig {
    eventId: string
    eventName: string
    stand: string
    price: string
    quantity: number
    holderName: string
}

const STEPS: { key: WizardStep, label: string, icon: React.ReactNode }[] = [
    { key: 'user', label: 'Identify User', icon: <User className="w-4 h-4" /> },
    { key: 'ticket', label: 'Ticket Details', icon: <Ticket className="w-4 h-4" /> },
    { key: 'review', label: 'Review & Grant', icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: 'success', label: 'Complete', icon: <CheckCircle2 className="w-4 h-4" /> },
]

export default function TicketGrantWizard() {
    const [step, setStep] = useState<WizardStep>('user')
    const [loading, setLoading] = useState(false)

    // User step state
    const [emailSearch, setEmailSearch] = useState('')
    const [searchResults, setSearchResults] = useState<UserData[]>([])
    const [searching, setSearching] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', password: '' })

    // Ticket step state
    const [eventType, setEventType] = useState<'sports' | 'event'>('sports')
    const [events, setEvents] = useState<any[]>([])
    const [eventsLoading, setEventsLoading] = useState(false)
    const [ticketConfig, setTicketConfig] = useState<TicketConfig>({
        eventId: '',
        eventName: '',
        stand: 'Regular',
        price: '5000',
        quantity: 1,
        holderName: ''
    })

    // Success state
    const [grantResult, setGrantResult] = useState<any>(null)

    // Search users by email
    const handleSearchUser = async () => {
        if (emailSearch.length < 3) {
            toast.error("Enter at least 3 characters to search")
            return
        }
        setSearching(true)
        setShowCreateForm(false)
        try {
            const res = await api.get(`/admin/users?email=${emailSearch.trim()}`)
            setSearchResults(res.data.users || [])
            if (res.data.users?.length === 0) {
                setShowCreateForm(true)
                setNewUser(prev => ({ ...prev, email: emailSearch.trim() }))
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Search failed")
        } finally {
            setSearching(false)
        }
    }

    // Create new user
    const handleCreateUser = async () => {
        if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password) {
            toast.error("All fields are required")
            return
        }
        setLoading(true)
        try {
            const res = await api.post('/admin/users', newUser)
            if (res.data.success) {
                setSelectedUser(res.data.user)
                toast.success(res.data.isNew ? "User created!" : "Existing user found!")
                setShowCreateForm(false)
                setSearchResults([])
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to create user")
        } finally {
            setLoading(false)
        }
    }

    // Fetch events for ticket step
    useEffect(() => {
        if (step === 'ticket') {
            setEventsLoading(true)
            api.get(`/events?forScanner=true&type=${eventType}`).then(res => {
                setEvents(res.data.events || [])
            }).catch(err => {
                toast.error("Failed to load events")
            }).finally(() => setEventsLoading(false))
        }
    }, [step, eventType])

    // Update default stand when eventType changes
    useEffect(() => {
        if (eventType === 'sports') {
            setTicketConfig(prev => ({ ...prev, stand: 'Popular Stand', price: '500' }))
        } else {
            setTicketConfig(prev => ({ ...prev, stand: 'Regular', price: '5000' }))
        }
        setTicketConfig(prev => ({ ...prev, eventId: '', eventName: '' }))
    }, [eventType])

    // Grant tickets
    const handleGrant = async () => {
        setLoading(true)
        try {
            const res = await api.post('/admin/tickets/grant', {
                userId: selectedUser?._id,
                eventId: ticketConfig.eventId,
                stand: ticketConfig.stand,
                price: ticketConfig.price,
                quantity: ticketConfig.quantity,
                holderName: ticketConfig.holderName || `${selectedUser?.firstName} ${selectedUser?.lastName}`
            })
            if (res.data.success) {
                setGrantResult(res.data)
                setStep('success')
                toast.success("Tickets granted!")
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to grant tickets")
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setStep('user')
        setSelectedUser(null)
        setEmailSearch('')
        setSearchResults([])
        setShowCreateForm(false)
        setNewUser({ firstName: '', lastName: '', email: '', password: '' })
        setTicketConfig({ eventId: '', eventName: '', stand: 'Regular', price: '5000', quantity: 1, holderName: '' })
        setGrantResult(null)
    }

    const currentStepIndex = STEPS.findIndex(s => s.key === step)

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Progress Bar */}
            <div className="flex items-center justify-between relative">
                {STEPS.map((s, i) => (
                    <div key={s.key} className="flex flex-col items-center z-10 flex-1">
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                            ${i < currentStepIndex
                                ? 'bg-green-500 border-green-500 text-white'
                                : i === currentStepIndex
                                    ? 'bg-orange-500 border-orange-500 text-white scale-110 shadow-lg shadow-orange-500/30'
                                    : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                            }
                        `}>
                            {i < currentStepIndex ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                        </div>
                        <span className={`mt-2 text-xs font-bold uppercase tracking-widest transition-colors ${i <= currentStepIndex ? 'text-white' : 'text-zinc-600'
                            }`}>
                            {s.label}
                        </span>
                    </div>
                ))}
                {/* Progress line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-800 -z-0 mx-12" />
                <div
                    className="absolute top-5 left-0 h-0.5 bg-orange-500 -z-0 transition-all duration-500 ml-12"
                    style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * (100 - 15)}%` }}
                />
            </div>

            {/* Step Content */}
            <Card className="bg-zinc-950 border-zinc-800 shadow-2xl">
                {/* =================== STEP 1: USER =================== */}
                {step === 'user' && (
                    <>
                        <CardHeader className="border-b border-zinc-800">
                            <CardTitle className="text-white flex items-center gap-2">
                                <User className="text-orange-500" /> Identify User
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Search for an existing user by email, or create a new account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {/* Selected User Badge */}
                            {selectedUser && (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="text-green-500 w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{selectedUser.firstName} {selectedUser.lastName}</p>
                                            <p className="text-zinc-400 text-sm">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="text-zinc-400 hover:text-white">
                                        Change
                                    </Button>
                                </div>
                            )}

                            {!selectedUser && (
                                <>
                                    {/* Search Bar */}
                                    <div className="space-y-2">
                                        <Label className="text-zinc-300">Search by Email</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="email"
                                                placeholder="user@example.com"
                                                value={emailSearch}
                                                onChange={(e) => setEmailSearch(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                                                className="bg-zinc-900 border-zinc-700 text-white flex-1"
                                            />
                                            <Button onClick={handleSearchUser} disabled={searching} className="bg-orange-600 hover:bg-orange-700">
                                                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Search Results */}
                                    {searchResults.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-zinc-400 text-xs">Results</Label>
                                            {searchResults.map(user => (
                                                <button
                                                    key={user._id}
                                                    onClick={() => { setSelectedUser(user); setSearchResults([]) }}
                                                    className="w-full bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 rounded-xl p-4 flex items-center gap-3 transition-all text-left group"
                                                >
                                                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                                                        <User className="w-4 h-4 text-zinc-400 group-hover:text-orange-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                                                        <p className="text-zinc-500 text-sm">{user.email}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Create User Form */}
                                    {showCreateForm && (
                                        <div className="space-y-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <UserPlus className="text-orange-500 w-5 h-5" />
                                                <h3 className="text-white font-bold">Create New Account</h3>
                                            </div>
                                            <p className="text-zinc-500 text-sm">No user found. Create a new account below.</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-zinc-300">First Name</Label>
                                                    <Input
                                                        value={newUser.firstName}
                                                        onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                                                        className="bg-zinc-900 border-zinc-700 text-white"
                                                        placeholder="John"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-zinc-300">Last Name</Label>
                                                    <Input
                                                        value={newUser.lastName}
                                                        onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                                                        className="bg-zinc-900 border-zinc-700 text-white"
                                                        placeholder="Doe"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-zinc-300">Email</Label>
                                                <Input
                                                    value={newUser.email}
                                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                                    className="bg-zinc-900 border-zinc-700 text-white"
                                                    placeholder="user@example.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-zinc-300">Password</Label>
                                                <Input
                                                    type="password"
                                                    value={newUser.password}
                                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                                    className="bg-zinc-900 border-zinc-700 text-white"
                                                    placeholder="••••••••"
                                                />
                                                <p className="text-xs text-zinc-600">Minimum 6 characters</p>
                                            </div>
                                            <Button
                                                onClick={handleCreateUser}
                                                disabled={loading}
                                                className="w-full bg-orange-600 hover:bg-orange-700"
                                            >
                                                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...</> : <><UserPlus className="w-4 h-4 mr-2" /> Create Account</>}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Next Button */}
                            <div className="flex justify-end pt-4 border-t border-zinc-800">
                                <Button
                                    disabled={!selectedUser}
                                    onClick={() => setStep('ticket')}
                                    className="bg-orange-600 hover:bg-orange-700 disabled:opacity-30"
                                >
                                    Next: Ticket Details <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}

                {/* =================== STEP 2: TICKET =================== */}
                {step === 'ticket' && (
                    <>
                        <CardHeader className="border-b border-zinc-800">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Ticket className="text-orange-500" /> Ticket Configuration
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Select the event and configure ticket details for <span className="text-white font-medium">{selectedUser?.firstName} {selectedUser?.lastName}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {/* Event Type Toggle */}
                            <div className="space-y-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Event Type</Label>
                                <div className="flex gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                                    <button
                                        onClick={() => setEventType('sports')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${eventType === 'sports' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        Football Match
                                    </button>
                                    <button
                                        onClick={() => setEventType('event')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${eventType === 'event' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        Regular Event
                                    </button>
                                </div>
                            </div>

                            {/* Event Selection */}
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Select Event</Label>
                                {eventsLoading ? (
                                    <div className="flex items-center gap-2 text-zinc-500 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Loading available events...
                                    </div>
                                ) : (
                                    <Select
                                        value={ticketConfig.eventId}
                                        onValueChange={(v) => {
                                            const ev = events.find((e: any) => e._id === v)
                                            setTicketConfig({
                                                ...ticketConfig,
                                                eventId: v,
                                                eventName: ev?.type === 'sports' ? `${ev.homeTeam} vs ${ev.awayTeam}` : ev?.title || 'Unknown',
                                                price: String(ev?.regularPrice || (eventType === 'sports' ? 500 : 5000))
                                            })
                                        }}
                                    >
                                        <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-12">
                                            <SelectValue placeholder={`Select a ${eventType === 'sports' ? 'match' : 'event'}`} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                            {events.length === 0 ? (
                                                <div className="p-4 text-center text-zinc-500 text-sm italic">
                                                    No upcoming {eventType === 'sports' ? 'matches' : 'events'} found
                                                </div>
                                            ) : events.map((ev: any) => (
                                                <SelectItem key={ev._id} value={ev._id} className="cursor-pointer">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold">
                                                            {ev.type === 'sports' ? `${ev.homeTeam} vs ${ev.awayTeam}` : ev.title}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-500">
                                                            {new Date(ev.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} @ {ev.venue}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Ticket Class / Stand</Label>
                                    <Select
                                        value={ticketConfig.stand}
                                        onValueChange={(v) => {
                                            const ev = events.find((e: any) => e._id === ticketConfig.eventId)
                                            let price = ticketConfig.price

                                            // Dynamic price logic based on category
                                            if (eventType === 'sports') {
                                                if (v === 'Popular Stand') price = '500'
                                                else if (v === 'Cover Stand Regular') price = '2000'
                                                else if (v === 'Cover Stand Executive') price = '10000'
                                            } else {
                                                if (ev) {
                                                    if (v === 'Regular') price = String(ev.regularPrice || 5000)
                                                    else if (v === 'VIP') price = String(ev.vipPrice || 10000)
                                                }
                                            }

                                            setTicketConfig({ ...ticketConfig, stand: v, price })
                                        }}
                                    >
                                        <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                            {eventType === 'sports' ? (
                                                <>
                                                    <SelectItem value="Popular Stand">Popular Stand (₦500)</SelectItem>
                                                    <SelectItem value="Cover Stand Regular">Cover Stand Regular (₦2,000)</SelectItem>
                                                    <SelectItem value="Cover Stand Executive">Cover Stand Executive (₦10,000)</SelectItem>
                                                </>
                                            ) : (
                                                <>
                                                    <SelectItem value="Regular">Regular</SelectItem>
                                                    <SelectItem value="VIP">VIP</SelectItem>
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Price (₦)</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={ticketConfig.price}
                                        onChange={e => setTicketConfig({ ...ticketConfig, price: e.target.value })}
                                        className="bg-zinc-900 border-zinc-700 text-white h-12"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Quantity</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={ticketConfig.quantity}
                                        onChange={e => setTicketConfig({ ...ticketConfig, quantity: parseInt(e.target.value) || 1 })}
                                        className="bg-zinc-900 border-zinc-700 text-white h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-300">Holder Name</Label>
                                    <Input
                                        placeholder={`${selectedUser?.firstName} ${selectedUser?.lastName}`}
                                        value={ticketConfig.holderName}
                                        onChange={e => setTicketConfig({ ...ticketConfig, holderName: e.target.value })}
                                        className="bg-zinc-900 border-zinc-700 text-white h-12"
                                    />
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between pt-6 border-t border-zinc-800">
                                <Button variant="outline" onClick={() => setStep('user')} className="border-zinc-700 h-12 px-6">
                                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                </Button>
                                <Button
                                    disabled={!ticketConfig.eventId}
                                    onClick={() => setStep('review')}
                                    className="bg-orange-600 hover:bg-orange-700 h-12 px-8 font-bold disabled:opacity-30"
                                >
                                    Review Details <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}

                {/* =================== STEP 3: REVIEW =================== */}
                {step === 'review' && (
                    <>
                        <CardHeader className="border-b border-zinc-800">
                            <CardTitle className="text-white flex items-center gap-2">
                                <CheckCircle2 className="text-orange-500" /> Review & Confirm
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Verify the details below before granting tickets.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            {/* User Summary */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
                                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest">User</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center">
                                        <User className="text-orange-500 w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-lg">{selectedUser?.firstName} {selectedUser?.lastName}</p>
                                        <p className="text-zinc-400 text-sm">{selectedUser?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Summary */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Ticket Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-zinc-500 text-xs mb-1">Event</p>
                                        <p className="text-white font-medium">{ticketConfig.eventName}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs mb-1">Class</p>
                                        <p className="text-white font-medium">{ticketConfig.stand}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs mb-1">Quantity</p>
                                        <p className="text-white font-bold text-xl">{ticketConfig.quantity}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs mb-1">Price per Ticket</p>
                                        <p className="text-white font-bold text-xl">₦{Number(ticketConfig.price).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="border-t border-zinc-800 pt-3">
                                    <p className="text-zinc-500 text-xs mb-1">Total Value</p>
                                    <p className="text-orange-500 font-black text-2xl">
                                        ₦{(Number(ticketConfig.price) * ticketConfig.quantity).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
                                <Ticket className="text-orange-500 mt-0.5 shrink-0" />
                                <p className="text-sm text-zinc-300">
                                    This will create <span className="text-white font-bold">{ticketConfig.quantity}</span> paid ticket(s)
                                    assigned to <span className="text-white font-bold">{selectedUser?.firstName}</span>,
                                    bypassing Paystack. The tickets will appear in their account immediately.
                                </p>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between pt-4 border-t border-zinc-800">
                                <Button variant="outline" onClick={() => setStep('ticket')} className="border-zinc-700">
                                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                </Button>
                                <Button
                                    onClick={handleGrant}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 shadow-lg shadow-green-900/20"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Granting...</>
                                    ) : (
                                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Grant Tickets</>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}

                {/* =================== STEP 4: SUCCESS =================== */}
                {step === 'success' && (
                    <CardContent className="py-10 text-center space-y-6">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/30">
                            <CheckCircle2 className="text-green-500 w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">Tickets Granted Successfully!</h2>
                            <p className="text-zinc-400 mt-2">{grantResult?.message}</p>
                        </div>

                        {/* High Fidelity Ticket Preview */}
                        <div className="border-y border-zinc-800 py-10 -mx-6 bg-zinc-900/40">
                            <TicketCarousel
                                tickets={grantResult?.tickets || []}
                                eventInfo={events.find(e => e._id === ticketConfig.eventId)}
                                user={selectedUser}
                            />
                        </div>

                        <div className="pt-6">
                            <Button onClick={handleReset} variant="outline" className="border-zinc-700 hover:bg-zinc-900">
                                <ArrowLeft className="mr-2 w-4 h-4" /> Grant More Tickets
                            </Button>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}
