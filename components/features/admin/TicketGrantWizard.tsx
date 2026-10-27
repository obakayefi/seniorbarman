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
            <div className="flex items-center justify-between relative px-2">
                {STEPS.map((s, i) => (
                    <div key={s.key} className="flex flex-col items-center z-10 flex-1">
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                            ${i < currentStepIndex
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                : i === currentStepIndex
                                    ? 'bg-orange-500 border-orange-500 text-white scale-110 shadow-md shadow-orange-500/30'
                                    : 'bg-muted border-border text-muted-foreground'
                            }
                        `}>
                            {i < currentStepIndex ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                        </div>
                        <span className={`mt-2 text-[11px] font-bold uppercase tracking-wider transition-colors text-center ${i <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                            {s.label}
                        </span>
                    </div>
                ))}
                {/* Progress line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0 mx-12" />
                <div
                    className="absolute top-5 left-0 h-0.5 bg-orange-500 -z-0 transition-all duration-500 ml-12"
                    style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * (100 - 15)}%` }}
                />
            </div>

            {/* Step Content */}
            <Card className="bg-card border border-border dark:border-zinc-800 rounded-sm shadow-md dark:shadow-black/40 overflow-hidden">
                {/* =================== STEP 1: USER =================== */}
                {step === 'user' && (
                    <>
                        <CardHeader className="border-b border-border/80 dark:border-zinc-800 bg-muted/20 dark:bg-zinc-900/40 p-5 sm:p-6">
                            <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                                <User className="text-orange-500" /> Identify User
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-xs">
                                Search for an existing user by email, or create a new account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 space-y-6">
                            {/* Selected User Badge */}
                            {selectedUser && (
                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-sm p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-foreground font-bold">{selectedUser.firstName} {selectedUser.lastName}</p>
                                            <p className="text-muted-foreground text-xs">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="text-muted-foreground hover:text-foreground">
                                        Change
                                    </Button>
                                </div>
                            )}

                            {!selectedUser && (
                                <>
                                    {/* Search Bar */}
                                    <div className="space-y-2">
                                        <Label className="text-foreground text-xs font-bold uppercase tracking-wider">Search by Email</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="email"
                                                placeholder="user@example.com"
                                                value={emailSearch}
                                                onChange={(e) => setEmailSearch(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                                                className="bg-background border-border dark:border-zinc-700 text-foreground rounded-sm flex-1 focus:border-orange-500"
                                            />
                                            <Button onClick={handleSearchUser} disabled={searching} className="bg-orange-500 hover:bg-orange-600 text-white rounded-sm">
                                                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Search Results */}
                                    {searchResults.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Results</Label>
                                            {searchResults.map(user => (
                                                <button
                                                    key={user._id}
                                                    onClick={() => { setSelectedUser(user); setSearchResults([]) }}
                                                    className="w-full bg-muted/40 dark:bg-zinc-800/40 border border-border dark:border-zinc-700 hover:border-orange-500 rounded-sm p-4 flex items-center gap-3 transition-all text-left group"
                                                >
                                                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                                                        <User className="w-4 h-4 text-muted-foreground group-hover:text-orange-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-foreground font-bold text-sm">{user.firstName} {user.lastName}</p>
                                                        <p className="text-muted-foreground text-xs">{user.email}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Create User Form */}
                                    {showCreateForm && (
                                        <div className="space-y-4 bg-muted/30 dark:bg-zinc-900/40 border border-border dark:border-zinc-800 rounded-sm p-5 sm:p-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <UserPlus className="text-orange-500 w-5 h-5" />
                                                <h3 className="text-foreground font-bold">Create New Account</h3>
                                            </div>
                                            <p className="text-muted-foreground text-xs">No user found. Create a new account below.</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-foreground text-xs font-bold">First Name</Label>
                                                    <Input
                                                        value={newUser.firstName}
                                                        onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                                                        className="bg-background border-border dark:border-zinc-700 text-foreground rounded-sm"
                                                        placeholder="John"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-foreground text-xs font-bold">Last Name</Label>
                                                    <Input
                                                        value={newUser.lastName}
                                                        onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                                                        className="bg-background border-border dark:border-zinc-700 text-foreground rounded-sm"
                                                        placeholder="Doe"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-foreground text-xs font-bold">Email</Label>
                                                <Input
                                                    value={newUser.email}
                                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                                    className="bg-background border-border dark:border-zinc-700 text-foreground rounded-sm"
                                                    placeholder="user@example.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-foreground text-xs font-bold">Password</Label>
                                                <Input
                                                    type="password"
                                                    value={newUser.password}
                                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                                    className="bg-background border-border dark:border-zinc-700 text-foreground rounded-sm"
                                                    placeholder="••••••••"
                                                />
                                                <p className="text-[11px] text-muted-foreground">Minimum 6 characters</p>
                                            </div>
                                            <Button
                                                onClick={handleCreateUser}
                                                disabled={loading}
                                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-sm h-10 uppercase tracking-wider text-xs shadow-sm"
                                            >
                                                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...</> : <><UserPlus className="w-4 h-4 mr-2" /> Create Account</>}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Next Button */}
                            <div className="flex justify-end pt-4 border-t border-border dark:border-zinc-800">
                                <Button
                                    disabled={!selectedUser}
                                    onClick={() => setStep('ticket')}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-sm h-10 px-6 uppercase tracking-wider text-xs shadow-sm disabled:opacity-40"
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
                        <CardHeader className="border-b border-border/80 dark:border-zinc-800 bg-muted/20 dark:bg-zinc-900/40 p-5 sm:p-6">
                            <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                                <Ticket className="text-orange-500" /> Ticket Configuration
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-xs">
                                Select the event and configure ticket details for <span className="text-foreground font-bold">{selectedUser?.firstName} {selectedUser?.lastName}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 space-y-6">
                            {/* Event Type Toggle */}
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Event Type</Label>
                                <div className="flex gap-2 bg-muted p-1 rounded-sm border border-border">
                                    <button
                                        onClick={() => setEventType('sports')}
                                        className={`flex-1 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-all ${eventType === 'sports' ? 'bg-orange-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Football Match
                                    </button>
                                    <button
                                        onClick={() => setEventType('event')}
                                        className={`flex-1 py-2 rounded-xs text-xs font-bold uppercase tracking-wider transition-all ${eventType === 'event' ? 'bg-orange-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Regular Event
                                    </button>
                                </div>
                            </div>

                            {/* Event Selection */}
                            <div className="space-y-2">
                                <Label className="text-foreground text-xs font-bold">Select Event</Label>
                                {eventsLoading ? (
                                    <div className="flex items-center gap-2 text-muted-foreground p-3 bg-muted/40 rounded-sm border border-border text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin text-orange-500" /> Loading available events...
                                    </div>
                                ) : (
                                    <Select
                                        value={ticketConfig.eventId}
                                        onValueChange={(v) => {
                                            const ev = events.find((e: any) => e._id === v)
                                            const hName = ev?.homeTeam?.name || ev?.homeTeam || "";
                                            const aName = ev?.awayTeam?.name || ev?.awayTeam || "";
                                            setTicketConfig({
                                                ...ticketConfig,
                                                eventId: v,
                                                eventName: ev?.type === 'sports' ? `${hName} vs ${aName}` : ev?.title || 'Unknown',
                                                price: String(ev?.regularPrice || (eventType === 'sports' ? 500 : 5000))
                                            })
                                        }}
                                    >
                                        <SelectTrigger className="bg-background border-border dark:border-zinc-700 text-foreground h-11 rounded-sm">
                                            <SelectValue placeholder={`Select a ${eventType === 'sports' ? 'match' : 'event'}`} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border dark:border-zinc-800 text-foreground">
                                            {events.length === 0 ? (
                                                <div className="p-4 text-center text-muted-foreground text-sm italic">
                                                    No upcoming {eventType === 'sports' ? 'matches' : 'events'} found
                                                </div>
                                            ) : events.map((ev: any) => {
                                                const hName = ev?.homeTeam?.name || ev?.homeTeam || "";
                                                const aName = ev?.awayTeam?.name || ev?.awayTeam || "";
                                                return (
                                                    <SelectItem key={ev._id} value={ev._id} className="cursor-pointer">
                                                        <div className="flex flex-col py-0.5">
                                                            <span className="font-bold text-foreground">
                                                                {ev.type === 'sports' ? `${hName} vs ${aName}` : ev.title}
                                                            </span>
                                                            <span className="text-[11px] text-muted-foreground">
                                                                {new Date(ev.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} @ {ev.venue}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground text-xs font-bold">Ticket Class / Stand</Label>
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
                                        <SelectTrigger className="bg-background border-border dark:border-zinc-700 text-foreground h-11 rounded-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border dark:border-zinc-800 text-foreground">
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
                                    <Label className="text-foreground text-xs font-bold">Price (₦)</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={ticketConfig.price}
                                        onChange={e => setTicketConfig({ ...ticketConfig, price: e.target.value })}
                                        className="bg-background border-border dark:border-zinc-700 text-foreground h-11 rounded-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-foreground text-xs font-bold">Quantity</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={ticketConfig.quantity}
                                        onChange={e => setTicketConfig({ ...ticketConfig, quantity: parseInt(e.target.value) || 1 })}
                                        className="bg-background border-border dark:border-zinc-700 text-foreground h-11 rounded-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground text-xs font-bold">Holder Name</Label>
                                    <Input
                                        placeholder={`${selectedUser?.firstName} ${selectedUser?.lastName}`}
                                        value={ticketConfig.holderName}
                                        onChange={e => setTicketConfig({ ...ticketConfig, holderName: e.target.value })}
                                        className="bg-background border-border dark:border-zinc-700 text-foreground h-11 rounded-sm"
                                    />
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between pt-6 border-t border-border dark:border-zinc-800">
                                <Button variant="outline" onClick={() => setStep('user')} className="border-border dark:border-zinc-700 h-11 px-6 font-bold rounded-sm">
                                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                </Button>
                                <Button
                                    disabled={!ticketConfig.eventId}
                                    onClick={() => setStep('review')}
                                    className="bg-orange-500 hover:bg-orange-600 text-white h-11 px-8 font-bold rounded-sm uppercase tracking-wider text-xs shadow-sm disabled:opacity-40"
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
                        <CardHeader className="border-b border-border/80 dark:border-zinc-800 bg-muted/20 dark:bg-zinc-900/40 p-5 sm:p-6">
                            <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                                <CheckCircle2 className="text-orange-500" /> Review & Confirm
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-xs">
                                Verify the details below before granting tickets.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 space-y-6">
                            {/* User Summary */}
                            <div className="bg-muted/30 dark:bg-zinc-800/40 border border-border dark:border-zinc-800 rounded-sm p-5 space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">User</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-foreground font-bold text-lg">{selectedUser?.firstName} {selectedUser?.lastName}</p>
                                        <p className="text-muted-foreground text-sm">{selectedUser?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Summary */}
                            <div className="bg-muted/30 dark:bg-zinc-800/40 border border-border dark:border-zinc-800 rounded-sm p-5 space-y-4">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ticket Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-muted-foreground text-xs mb-1">Event</p>
                                        <p className="text-foreground font-bold">{ticketConfig.eventName}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs mb-1">Class</p>
                                        <p className="text-foreground font-bold">{ticketConfig.stand}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs mb-1">Quantity</p>
                                        <p className="text-foreground font-black text-xl">{ticketConfig.quantity}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs mb-1">Price per Ticket</p>
                                        <p className="text-foreground font-black text-xl">₦{Number(ticketConfig.price).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="border-t border-border dark:border-zinc-800 pt-3">
                                    <p className="text-muted-foreground text-xs mb-1">Total Value</p>
                                    <p className="text-orange-500 font-black text-2xl">
                                        ₦{(Number(ticketConfig.price) * ticketConfig.quantity).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="bg-orange-500/10 border border-orange-500/25 rounded-sm p-4 flex items-start gap-3">
                                <Ticket className="text-orange-500 mt-0.5 shrink-0 w-5 h-5" />
                                <p className="text-sm text-foreground">
                                    This will create <span className="font-bold text-orange-500">{ticketConfig.quantity}</span> paid ticket(s)
                                    assigned to <span className="font-bold">{selectedUser?.firstName}</span>,
                                    bypassing Paystack. The tickets will appear in their account immediately.
                                </p>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between pt-4 border-t border-border dark:border-zinc-800">
                                <Button variant="outline" onClick={() => setStep('ticket')} className="border-border dark:border-zinc-700 font-bold rounded-sm h-11 px-6">
                                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                </Button>
                                <Button
                                    onClick={handleGrant}
                                    disabled={loading}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 rounded-sm h-11 uppercase tracking-wider text-xs shadow-sm"
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
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30">
                            <CheckCircle2 className="text-emerald-500 w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground">Tickets Granted Successfully!</h2>
                            <p className="text-muted-foreground mt-2 text-sm">{grantResult?.message}</p>
                        </div>

                        {/* High Fidelity Ticket Preview */}
                        <div className="border-y border-border dark:border-zinc-800 py-10 -mx-6 bg-muted/20">
                            <TicketCarousel
                                tickets={grantResult?.tickets || []}
                                eventInfo={events.find(e => e._id === ticketConfig.eventId)}
                                user={selectedUser}
                            />
                        </div>

                        <div className="pt-6">
                            <Button onClick={handleReset} variant="outline" className="border-border dark:border-zinc-700 hover:bg-muted font-bold rounded-sm h-11 px-6">
                                <ArrowLeft className="mr-2 w-4 h-4" /> Grant More Tickets
                            </Button>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}
