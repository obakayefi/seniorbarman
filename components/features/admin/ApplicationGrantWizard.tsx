"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
    Loader2, UserPlus, Search, ClipboardList, CheckCircle2,
    ArrowRight, ArrowLeft, User, Sparkles, Mic2
} from "lucide-react"
import api from "@/lib/axios"
import { Badge } from '@/components/ui/badge'

type WizardStep = 'user' | 'audition' | 'review' | 'success'

interface UserData {
    _id: string
    firstName: string
    lastName: string
    email: string
}

interface AuditionConfig {
    eventId: string
    eventName: string
    applicationFee: number
    requestPicture: boolean
}

const STEPS: { key: WizardStep, label: string, icon: React.ReactNode }[] = [
    { key: 'user', label: 'Identify User', icon: <User className="w-4 h-4" /> },
    { key: 'audition', label: 'Audition Details', icon: <Mic2 className="w-4 h-4" /> },
    { key: 'review', label: 'Review & Grant', icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: 'success', label: 'Complete', icon: <CheckCircle2 className="w-4 h-4" /> },
]

export default function ApplicationGrantWizard() {
    const [step, setStep] = useState<WizardStep>('user')
    const [loading, setLoading] = useState(false)

    // User step state
    const [emailSearch, setEmailSearch] = useState('')
    const [searchResults, setSearchResults] = useState<UserData[]>([])
    const [searching, setSearching] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', password: '' })

    // Audition step state
    const [events, setEvents] = useState<any[]>([])
    const [eventsLoading, setEventsLoading] = useState(false)
    const [auditionConfig, setAuditionConfig] = useState<AuditionConfig>({
        eventId: '',
        eventName: '',
        applicationFee: 0,
        requestPicture: false
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

    // Fetch audition events
    useEffect(() => {
        if (step === 'audition') {
            setEventsLoading(true)
            api.get('/events?forScanner=true&type=event').then(res => {
                const filtered = (res.data.events || []).filter((e: any) => e.isAudition || e.requiresApplication)
                setEvents(filtered)
            }).catch(() => {
                toast.error("Failed to load auditions")
            }).finally(() => setEventsLoading(false))
        }
    }, [step])

    // Grant Application
    const handleGrant = async () => {
        setLoading(true)
        try {
            const res = await api.post('/admin/applications/grant', {
                userId: selectedUser?._id,
                eventId: auditionConfig.eventId,
                amountPaid: auditionConfig.applicationFee,
            })
            if (res.data.success) {
                setGrantResult(res.data)
                setStep('success')
                toast.success("Application granted and approved!")
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to grant application")
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
        setAuditionConfig({ eventId: '', eventName: '', applicationFee: 0, requestPicture: false })
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
                                ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                                : i === currentStepIndex
                                    ? 'bg-purple-500 border-purple-500 text-white scale-110 shadow-md shadow-purple-500/30'
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
                    className="absolute top-5 left-0 h-0.5 bg-purple-500 -z-0 transition-all duration-500 ml-12"
                    style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * (100 - 15)}%` }}
                />
            </div>

            {/* Step Content */}
            <Card className="bg-card border border-border rounded-lg shadow-xs overflow-hidden">
                {/* =================== STEP 1: USER =================== */}
                {step === 'user' && (
                    <>
                        <CardHeader className="border-b border-border bg-muted/20 p-5 sm:p-6">
                            <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                                <User className="text-purple-500" /> Identify Audition Candidate
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-xs">
                                Search for an existing candidate by email, or create a new account for them.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 space-y-6">
                            {/* Selected User Badge */}
                            {selectedUser && (
                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="text-purple-500 w-5 h-5" />
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
                                        <Label className="text-foreground text-xs font-bold uppercase tracking-wider">Search Candidate by Email</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="email"
                                                placeholder="candidate@example.com"
                                                value={emailSearch}
                                                onChange={(e) => setEmailSearch(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                                                className="bg-background border-border text-foreground rounded-md flex-1 focus:border-purple-500"
                                            />
                                            <Button onClick={handleSearchUser} disabled={searching} className="bg-purple-600 hover:bg-purple-500 text-white rounded-md">
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
                                                    className="w-full bg-muted/40 border border-border hover:border-purple-500 rounded-md p-4 flex items-center gap-3 transition-all text-left group"
                                                >
                                                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                                        <User className="w-4 h-4 text-muted-foreground group-hover:text-purple-500" />
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
                                        <div className="space-y-4 bg-muted/30 border border-border rounded-md p-5 sm:p-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <UserPlus className="text-purple-500 w-5 h-5" />
                                                <h3 className="text-foreground font-bold">Create New Candidate Account</h3>
                                            </div>
                                            <p className="text-muted-foreground text-xs">No account found. Create a candidate account below.</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-foreground text-xs font-bold">First Name</Label>
                                                    <Input
                                                        value={newUser.firstName}
                                                        onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                                                        className="bg-background border-border text-foreground rounded-md"
                                                        placeholder="Jane"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-foreground text-xs font-bold">Last Name</Label>
                                                    <Input
                                                        value={newUser.lastName}
                                                        onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                                                        className="bg-background border-border text-foreground rounded-md"
                                                        placeholder="Smith"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-foreground text-xs font-bold">Email</Label>
                                                <Input
                                                    value={newUser.email}
                                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                                    className="bg-background border-border text-foreground rounded-md"
                                                    placeholder="candidate@example.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-foreground text-xs font-bold">Password</Label>
                                                <Input
                                                    type="password"
                                                    value={newUser.password}
                                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                                    className="bg-background border-border text-foreground rounded-md"
                                                    placeholder="••••••••"
                                                />
                                                <p className="text-[11px] text-muted-foreground">Minimum 6 characters</p>
                                            </div>
                                            <Button
                                                onClick={handleCreateUser}
                                                disabled={loading}
                                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-md h-10 uppercase tracking-wider text-xs shadow-xs"
                                            >
                                                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...</> : <><UserPlus className="w-4 h-4 mr-2" /> Create Candidate Account</>}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Next Button */}
                            <div className="flex justify-end pt-4 border-t border-border">
                                <Button
                                    disabled={!selectedUser}
                                    onClick={() => setStep('audition')}
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-md h-10 px-6 uppercase tracking-wider text-xs shadow-xs disabled:opacity-40"
                                >
                                    Next: Audition Details <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}

                {/* =================== STEP 2: AUDITION =================== */}
                {step === 'audition' && (
                    <>
                        <CardHeader className="border-b border-border bg-muted/20 p-5 sm:p-6">
                            <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                                <Mic2 className="text-purple-500" /> Select Audition Event
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-xs">
                                Choose the audition event to grant entry/approval for <span className="text-foreground font-bold">{selectedUser?.firstName} {selectedUser?.lastName}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-foreground text-xs font-bold">Select Audition</Label>
                                {eventsLoading ? (
                                    <div className="flex items-center gap-2 text-muted-foreground p-3 bg-muted/40 rounded-md border border-border text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin text-purple-500" /> Loading available auditions...
                                    </div>
                                ) : (
                                    <Select
                                        value={auditionConfig.eventId}
                                        onValueChange={(v) => {
                                            const ev = events.find((e: any) => e._id === v)
                                            setAuditionConfig({
                                                eventId: v,
                                                eventName: ev?.title || 'Audition Event',
                                                applicationFee: ev?.applicationFee || 0,
                                                requestPicture: ev?.requestPicture || false
                                            })
                                        }}
                                    >
                                        <SelectTrigger className="bg-background border-border text-foreground h-11 rounded-md">
                                            <SelectValue placeholder="Select an Audition Event" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border text-foreground">
                                            {events.length === 0 ? (
                                                <div className="p-4 text-center text-muted-foreground text-sm italic">
                                                    No active audition events found
                                                </div>
                                            ) : events.map((ev: any) => (
                                                <SelectItem key={ev._id} value={ev._id} className="cursor-pointer">
                                                    <div className="flex flex-col py-0.5">
                                                        <span className="font-bold text-foreground">{ev.title}</span>
                                                        <span className="text-[11px] text-muted-foreground">
                                                            {new Date(ev.date).toLocaleDateString()} @ {ev.venue} · Fee: {ev.applicationFee > 0 ? `₦${ev.applicationFee.toLocaleString()}` : 'Free'}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {auditionConfig.eventId && (
                                <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-md space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Audition Title:</span>
                                        <span className="font-bold text-foreground">{auditionConfig.eventName}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Application Fee:</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                            {auditionConfig.applicationFee > 0 ? `₦${auditionConfig.applicationFee.toLocaleString()}` : 'FREE'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex justify-between pt-6 border-t border-border">
                                <Button variant="outline" onClick={() => setStep('user')} className="border-border h-11 px-6 font-bold rounded-md">
                                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                </Button>
                                <Button
                                    disabled={!auditionConfig.eventId}
                                    onClick={() => setStep('review')}
                                    className="bg-purple-600 hover:bg-purple-500 text-white h-11 px-8 font-bold rounded-md uppercase tracking-wider text-xs shadow-xs disabled:opacity-40"
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
                        <CardHeader className="border-b border-border bg-muted/20 p-5 sm:p-6">
                            <CardTitle className="text-foreground flex items-center gap-2 text-lg font-bold">
                                <CheckCircle2 className="text-purple-500" /> Review & Grant Audition Pass
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-xs">
                                Verify audition application details before granting approval.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 space-y-6">
                            {/* Candidate Summary */}
                            <div className="bg-muted/30 border border-border rounded-md p-5 space-y-3">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Candidate</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-500">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-foreground font-bold text-lg">{selectedUser?.firstName} {selectedUser?.lastName}</p>
                                        <p className="text-muted-foreground text-sm">{selectedUser?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Audition Details */}
                            <div className="bg-muted/30 border border-border rounded-md p-5 space-y-4">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Audition Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-muted-foreground text-xs mb-1">Audition Title</p>
                                        <p className="text-foreground font-bold">{auditionConfig.eventName}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground text-xs mb-1">Fee Waived / Recorded</p>
                                        <p className="text-emerald-600 dark:text-emerald-400 font-black text-lg">
                                            {auditionConfig.applicationFee > 0 ? `₦${auditionConfig.applicationFee.toLocaleString()}` : 'FREE'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="bg-purple-500/10 border border-purple-500/25 rounded-md p-4 flex items-start gap-3">
                                <ClipboardList className="text-purple-500 mt-0.5 shrink-0 w-5 h-5" />
                                <p className="text-sm text-foreground">
                                    This will create an <span className="font-bold text-purple-500">APPROVED</span> application entry for <span className="font-bold">{selectedUser?.firstName}</span>,
                                    allowing them immediate access to check-in for the audition.
                                </p>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between pt-4 border-t border-border">
                                <Button variant="outline" onClick={() => setStep('audition')} className="border-border font-bold rounded-md h-11 px-6">
                                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                                </Button>
                                <Button
                                    onClick={handleGrant}
                                    disabled={loading}
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 rounded-md h-11 uppercase tracking-wider text-xs shadow-xs"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Granting...</>
                                    ) : (
                                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Grant Audition Pass</>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </>
                )}

                {/* =================== STEP 4: SUCCESS =================== */}
                {step === 'success' && (
                    <CardContent className="py-10 text-center space-y-6">
                        <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-purple-500/30">
                            <CheckCircle2 className="text-purple-500 w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground">Audition Pass Granted!</h2>
                            <p className="text-muted-foreground mt-2 text-sm">{grantResult?.message}</p>
                        </div>

                        <div className="pt-6">
                            <Button onClick={handleReset} variant="outline" className="border-border hover:bg-muted font-bold rounded-md h-11 px-6">
                                <ArrowLeft className="mr-2 w-4 h-4" /> Grant Another Audition Pass
                            </Button>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    )
}
