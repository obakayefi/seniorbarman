"use client"
import React, { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "../ui/label"
import { ApplyDatePicker } from "./ApplyDatePicker"
import { Spinner } from "../ui/spinner"
import { STADIUMS } from "@/lib/utils"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FileUpload } from "../ui/file-upload"
import { useApp } from "@/context/AppContext"
import EventFormBuilder, { FormField } from "./EventFormBuilder"
import {
    ChevronDown, ChevronUp, ClipboardList,
    Trophy, CalendarDays, Mic2, Clock, MapPin,
    Plus, Trash2, X, ArrowRight
} from "lucide-react"
import { ROLES } from "@/lib/roles"
import { cn } from "@/lib/utils"

type DBTeam = {
    _id: string
    name: string
    logo?: string
    stadium?: string
}

// ── 3D Futuristic Icon Component ──────────────────────────────────────────────
function FuturisticIcon({
    icon: Icon,
    gradient,
    glow,
    size = 22,
}: {
    icon: React.ElementType
    gradient: string
    glow: string
    size?: number
}) {
    return (
        <div
            className="relative flex items-center justify-center w-12 h-12 rounded-xl"
            style={{
                background: gradient,
                boxShadow: `0 6px 20px ${glow}, inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.15)`,
                border: "1px solid rgba(255,255,255,0.15)",
            }}
        >
            {/* Top shine */}
            <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)",
                }}
            />
            <Icon size={size} className="text-white relative z-10 drop-shadow-sm" />
        </div>
    )
}

const EVENT_TYPE_CARDS = [
    {
        value: "sports",
        label: "Sports Match",
        description: "Football & stadium events",
        icon: Trophy,
        gradient: "linear-gradient(135deg, #16a34a 0%, #15803d 60%, #166534 100%)",
        glow: "rgba(22, 163, 74, 0.4)",
        activeRing: "ring-2 ring-green-500 border-green-500/50 bg-green-500/8",
        hoverClasses: "hover:border-green-500/40 hover:bg-green-500/5",
        dotColor: "bg-green-500",
        roles: [ROLES.TEAM_MANAGER, "admin", "super_admin"],
    },
    {
        value: "event",
        label: "Regular Event",
        description: "Concerts, parties & more",
        icon: CalendarDays,
        gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%)",
        glow: "rgba(249, 115, 22, 0.4)",
        activeRing: "ring-2 ring-orange-500 border-orange-500/50 bg-orange-500/8",
        hoverClasses: "hover:border-orange-500/40 hover:bg-orange-500/5",
        dotColor: "bg-orange-500",
        roles: [ROLES.ORGANIZER, "admin", "super_admin"],
    },
    {
        value: "audition",
        label: "Audition",
        description: "Open calls & talent search",
        icon: Mic2,
        gradient: "linear-gradient(135deg, #a855f7 0%, #9333ea 60%, #7e22ce 100%)",
        glow: "rgba(168, 85, 247, 0.4)",
        activeRing: "ring-2 ring-purple-500 border-purple-500/50 bg-purple-500/8",
        hoverClasses: "hover:border-purple-500/40 hover:bg-purple-500/5",
        dotColor: "bg-purple-500",
        roles: [ROLES.ORGANIZER, "admin", "super_admin"],
    },
]

// ── Section Header ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-3">
            {children}
        </p>
    )
}


// ── Field Row wrapper for responsive 2-col on desktop ────────────────────────
function FieldRow({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
            {children}
        </div>
    )
}

// ── Toggle ─────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, color = "orange" }: { checked: boolean; onChange: () => void; color?: string }) {
    const activeColor = color === "purple" ? "bg-purple-500" : color === "blue" ? "bg-blue-500" : "bg-orange-500"
    return (
        <button
            type="button"
            onClick={onChange}
            className={cn(
                "relative w-11 h-6 rounded-sm transition-all duration-200 shrink-0 shadow-inner",
                checked ? activeColor : "bg-muted-foreground/25"
            )}
        >
            <span className={cn(
                "absolute top-1 left-1 h-4 w-4 rounded-sm bg-white shadow-md transition-transform duration-200",
                checked ? "translate-x-5" : "translate-x-0"
            )} />
        </button>
    )
}

// ── Divider with label ─────────────────────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{label}</span>
            <div className="flex-1 h-px bg-border" />
        </div>
    )
}

// ── Main Form ──────────────────────────────────────────────────────────────────
const CreateEventForm = () => {
    const router = useRouter()
    const { user } = useApp()
    const isOrganizer = user?.role === ROLES.ORGANIZER
    const isTeamManager = user?.role === ROLES.TEAM_MANAGER

    const [currentEventType, setCurrentEventType] = useState(isOrganizer ? "event" : "sports")
    const [eventDate, setEventDate] = useState<Date | undefined>(undefined)
    const [month, setMonth] = useState<Date | undefined>(undefined)
    const [dateValue, setDateValue] = useState<Date | undefined>(undefined)

    const [dbTeams, setDbTeams] = useState<DBTeam[]>([])
    const [myTeam, setMyTeam] = useState<DBTeam | null>(null)

    useEffect(() => {
        fetch("/api/teams")
            .then(r => r.json())
            .then(data => { if (data.teams) setDbTeams(data.teams) })
            .catch(() => { })
    }, [])

    useEffect(() => {
        if (isTeamManager) {
            fetch("/api/teams/mine")
                .then(r => r.json())
                .then(data => {
                    if (data.teams && data.teams.length > 0) {
                        const team = data.teams[0]
                        setMyTeam(team)
                        setHomeTeam(team._id)
                        if (team.stadium) setEventVenue(team.stadium)
                    }
                })
                .catch(() => { })
        }
    }, [isTeamManager])

    useEffect(() => {
        const now = new Date()
        setEventDate(now); setMonth(now); setDateValue(now)
    }, [])

    const initialSportsTickets = [
        { name: "Popular", price: 500 },
        { name: "Regular", price: 2000 },
        { name: "Executive", price: 10000 },
    ]
    const initialEventTickets = [{ name: "Regular", price: 0 }]
    const [ticketTypes, setTicketTypes] = useState<{ name: string; price: number }[]>(
        isOrganizer ? initialEventTickets : initialSportsTickets
    )

    useEffect(() => {
        if (user?.role === ROLES.ORGANIZER) {
            setCurrentEventType("event")
            setTicketTypes(initialEventTickets)
        } else if (user?.role === ROLES.TEAM_MANAGER) {
            setCurrentEventType("sports")
            setTicketTypes(initialSportsTickets)
        }
    }, [user?.role])

    const [isAudition, setIsAudition] = useState(false)
    const [requestPicture, setRequestPicture] = useState(false)
    const [allowNoTickets, setAllowNoTickets] = useState(false)
    const [requiresApplication, setRequiresApplication] = useState(false)
    const [applicationFee, setApplicationFee] = useState(0)
    const [applicationFeeDisplay, setApplicationFeeDisplay] = useState("")
    const [formFields, setFormFields] = useState<FormField[]>([])
    const [showFormBuilder, setShowFormBuilder] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [homeTeam, setHomeTeam] = useState("")
    const [awayTeam, setAwayTeam] = useState("")
    const [eventVenue, setEventVenue] = useState("")
    const [files, setFiles] = useState<File[]>([])
    const [eventTitleVal, setEventTitleVal] = useState("")
    const [eventTimeVal, setEventTimeVal] = useState("16:00")
    const [ctaTextVal, setCtaTextVal] = useState("Book Ticket")
    const [resetKey, setResetKey] = useState(0)

    useEffect(() => {
        if (isAudition) { setRequiresApplication(true); setShowFormBuilder(true) }
    }, [isAudition])

    const formatPrice = (price: number) => price === 0 ? "" : price.toLocaleString()
    const parsePrice = (value: string) => Number(value.replace(/,/g, "")) || 0

    const formReset = (type: string = currentEventType) => {
        setAwayTeam(""); setEventTitleVal(""); setEventTimeVal("16:00"); setCtaTextVal("Book Ticket")
        setEventDate(undefined); setDateValue(undefined); setMonth(undefined)
        setFiles([]); setResetKey(prev => prev + 1)
        setRequiresApplication(false); setApplicationFee(0)
        setApplicationFeeDisplay(""); setFormFields([]); setShowFormBuilder(false)
        setIsAudition(false); setRequestPicture(false); setAllowNoTickets(false)
        if (type === "sports") {
            setHomeTeam(myTeam?._id ?? ""); setEventVenue(myTeam?.stadium ?? "")
            setTicketTypes(initialSportsTickets)
        } else {
            setHomeTeam(""); setEventVenue(""); setTicketTypes(initialEventTickets)
        }
    }

    const handleTypeSelect = (value: string) => {
        if (value === "audition") {
            formReset("event"); setIsAudition(true); setCurrentEventType("event")
        } else {
            formReset(value); setIsAudition(false); setCurrentEventType(value)
        }
    }

    const activeTypeValue = isAudition ? "audition" : currentEventType
    const visibleCards = EVENT_TYPE_CARDS.filter(card => {
        if (isOrganizer) return card.value !== "sports"
        if (isTeamManager) return card.value === "sports"
        return true
    })

    const onFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const combinedDate = eventDate ? new Date(eventDate) : undefined
        if (combinedDate && eventTimeVal) {
            const [h, m] = eventTimeVal.split(":").map(Number)
            if (!isNaN(h) && !isNaN(m)) combinedDate.setHours(h, m, 0, 0)
        }
        const eventDetails = {
            eventType: currentEventType ?? "N/A",
            homeTeam, awayTeam, eventVenue,
            eventTitle: eventTitleVal ?? "N/A",
            eventDate: combinedDate,
            imageFile: files[0],
            eventTime: eventTimeVal,
            ctaText: ctaTextVal.trim() || "Book Ticket",
            ticketTypes: JSON.stringify(ticketTypes),
            requiresApplication: String(requiresApplication),
            applicationFee: String(applicationFee),
            formFields: JSON.stringify(formFields),
            isAudition: String(isAudition),
            requestPicture: String(requestPicture),
            allowNoTickets: String(allowNoTickets),
        }
        const formData = new FormData()
        if (eventDetails.imageFile) formData.append("imageFile", eventDetails.imageFile)

        if (currentEventType === "sports") {
            const { eventTitle, imageFile, requiresApplication, applicationFee, formFields, ...data } = eventDetails
            Object.entries(data).forEach(([key, value]) => {
                if (value === null || value === undefined) return
                if (value instanceof Date) formData.append(key, value.toISOString())
                else formData.append(key, String(value))
            })
        }
        if (currentEventType === "event") {
            if (!eventDate) { toast.error("Please select an event date"); setIsLoading(false); return }
            if (!eventTitleVal) { toast.error("Please enter an event title"); setIsLoading(false); return }
            if (!allowNoTickets && ticketTypes.length < 1) { toast.error("Please add at least 1 ticket type"); setIsLoading(false); return }
            if (!allowNoTickets && ticketTypes.some(t => !t.name || t.price < 0)) { toast.error("Please fill in all ticket types properly"); setIsLoading(false); return }
            if (requiresApplication && formFields.length > 0) {
                const invalid = formFields.some(f => !f.label.trim() || ((f.type === "radio" || f.type === "checkbox") && f.options.some(o => !o.trim())))
                if (invalid) { toast.error("Please fill in all form field labels and options"); setIsLoading(false); return }
            }
            const { homeTeam, awayTeam, imageFile, ...data } = eventDetails
            Object.entries(data).forEach(([key, value]) => {
                if (value === null || value === undefined) return
                if (value instanceof Date) formData.append(key, value.toISOString())
                else formData.append(key, String(value))
            })
        }
        try {
            const res = await fetch("/api/events", { method: "POST", body: formData })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error || data.details || "Failed to create event"); throw new Error(data.error || "Failed") }
            toast.success("🥳 Event created successfully")
        } catch (error) {
            if (error instanceof Error) toast.error(error.message)
        } finally {
            setIsLoading(false); formReset()
        }
    }

    const formFilled = useMemo(() => {
        if (!eventDate || !eventTimeVal || !eventVenue) return false
        if (currentEventType === "sports") {
            return Boolean(homeTeam && awayTeam && (allowNoTickets || ticketTypes.every(t => t.name && t.price >= 0)))
        }
        return Boolean(
            eventTitleVal && files.length > 0 &&
            (allowNoTickets || (ticketTypes.every(t => t.name && t.price >= 0) && ticketTypes.length >= 1))
        )
    }, [currentEventType, eventDate, eventTimeVal, eventVenue, ticketTypes, files, homeTeam, awayTeam, eventTitleVal, allowNoTickets])

    return (
        <div className="w-full max-w-2xl">


            <form onSubmit={onFormSubmit}>
                <div className="py-6 flex flex-col gap-7">

                    {/* ── Section 1: Event Type ── */}
                    <div className="">
                        <SectionLabel>① Event Type</SectionLabel>
                        <div className={cn(
                            "grid gap-3",
                            visibleCards.length === 1 ? "grid-cols-1" :
                                visibleCards.length === 2 ? "grid-cols-2" : "grid-cols-3"
                        )}>
                            {visibleCards.map((card) => {
                                const isActive = activeTypeValue === card.value
                                return (
                                    <button
                                        key={card.value}
                                        type="button"
                                        onClick={() => handleTypeSelect(card.value)}
                                        className={cn(
                                            "relative flex flex-col items-center gap-3 p-4 rounded-sm border transition-all duration-200 text-center group",
                                            isActive
                                                ? card.activeRing + " border-transparent shadow-md"
                                                : "border-border bg-transparent " + card.hoverClasses
                                        )}
                                    >
                                        {/* Active dot — color matches card accent */}
                                        {isActive && (
                                            <span className={cn("absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full", card.dotColor)} />
                                        )}

                                        <FuturisticIcon
                                            icon={card.icon}
                                            gradient={card.gradient}
                                            glow={card.glow}
                                        />

                                        <div>
                                            <p className={cn(
                                                "text-xs font-black uppercase tracking-tight leading-tight",
                                                isActive ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {card.label}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block leading-tight">
                                                {card.description}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <SectionDivider label="Event Info" />

                    {/* ── Section 2: Type-Specific Fields ── */}
                    {currentEventType === "sports" ? (
                        <div className="flex flex-col gap-5">
                            {/* Home Team · Away Team · Stadium — 3-col on desktop */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Home Team */}
                                <div className="flex flex-col gap-2 min-w-0">
                                    <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Home Team</Label>
                                    {isTeamManager ? (
                                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-sm border border-border bg-muted/40 opacity-75 cursor-not-allowed h-10">
                                            {myTeam?.logo && <Image src={myTeam.logo} alt={myTeam.name} width={20} height={20} className="rounded shrink-0" />}
                                            <span className="text-sm text-foreground font-medium truncate flex-1">{myTeam ? myTeam.name : "Loading..."}</span>
                                            <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">Locked</span>
                                        </div>
                                    ) : (
                                        <Select onValueChange={setHomeTeam} value={homeTeam}>
                                            <SelectTrigger className="w-full border-border bg-card text-foreground rounded-sm">
                                                <SelectValue placeholder="Home" />
                                            </SelectTrigger>
                                            <SelectContent className="border-border">
                                                {dbTeams.map(team => (
                                                    <SelectItem key={team._id} value={team._id}>
                                                        <div className="flex items-center gap-2">
                                                            {team.logo && <Image src={team.logo} alt={team.name} width={18} height={18} className="rounded" />}
                                                            <span>{team.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                {/* Away Team */}
                                <div className="flex flex-col gap-2 min-w-0">
                                    <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Away Team</Label>
                                    <Select onValueChange={setAwayTeam} value={awayTeam}>
                                        <SelectTrigger className="w-full border-border bg-card text-foreground rounded-sm">
                                            <SelectValue placeholder="Away" />
                                        </SelectTrigger>
                                        <SelectContent className="border-border">
                                            {dbTeams.filter(t => isTeamManager ? t._id !== myTeam?._id : true).map(team => (
                                                <SelectItem key={team._id} value={team._id}>
                                                    <div className="flex items-center gap-2">
                                                        {team.logo && <Image src={team.logo} alt={team.name} width={18} height={18} className="rounded" />}
                                                        <span>{team.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Stadium */}
                                <div className="flex flex-col gap-2 min-w-0">
                                    <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest flex items-center gap-1">
                                        <MapPin size={11} /> Stadium
                                    </Label>
                                    <Select onValueChange={setEventVenue} value={eventVenue}>
                                        <SelectTrigger className="w-full border-border bg-card text-foreground rounded-sm">
                                            <SelectValue placeholder="Stadium" />
                                        </SelectTrigger>
                                        <SelectContent className="border-border">
                                            {STADIUMS.map((s, idx) => (
                                                <SelectItem key={s.name + idx} value={s.name}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{s.name}</span>
                                                        <span className="bg-muted text-muted-foreground py-0.5 px-2 rounded text-xs shrink-0">{s.state}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Sports Ticket Stands */}
                            <div className="flex flex-col gap-3">
                                <SectionLabel>Ticket Stands</SectionLabel>
                                {ticketTypes.map((ticket, index) => (
                                    <div key={index} className="grid grid-cols-[1fr_140px] gap-3 items-center p-3 bg-muted/20 border border-border rounded-sm">
                                        <Input
                                            className="border-border bg-card text-foreground text-sm rounded-md"
                                            value={ticket.name}
                                            onChange={(e) => { const n = [...ticketTypes]; n[index].name = e.target.value; setTicketTypes(n) }}
                                            placeholder="Stand name"
                                        />
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">₦</span>
                                            <Input
                                                type="text"
                                                className="border-border bg-card text-foreground pl-7 pr-10 text-sm rounded-md"
                                                value={ticket.price === 0 ? "" : formatPrice(ticket.price)}
                                                onChange={(e) => { const n = [...ticketTypes]; n[index].price = parsePrice(e.target.value); setTicketTypes(n) }}
                                                placeholder="0"
                                            />
                                            {ticket.price === 0 && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-green-500 font-black">FREE</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            {/* Title full width */}
                            <div className="flex flex-col gap-2">
                                <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Event Title</Label>
                                <Input
                                    type="text"
                                    className="text-foreground border-border bg-card rounded-sm"
                                    value={eventTitleVal}
                                    onChange={e => setEventTitleVal(e.target.value)}
                                    placeholder="e.g. Afrobeats Night Vol. 3"
                                />
                            </div>

                            {/* Venue full width */}
                            <div className="flex flex-col gap-2">
                                <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <MapPin size={11} /> Venue
                                </Label>
                                <Input
                                    type="text"
                                    className="text-foreground border-border bg-card rounded-sm"
                                    value={eventVenue}
                                    onChange={e => setEventVenue(e.target.value)}
                                    placeholder="e.g. Toscana Hotel, Enugu"
                                />
                            </div>

                            {/* Button CTA Text */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">
                                        Button Action Text (CTA)
                                    </Label>
                                    <span className="text-[10px] text-muted-foreground">Default: &quot;Book Ticket&quot;</span>
                                </div>
                                <Input
                                    type="text"
                                    className="text-foreground border-border bg-card rounded-sm"
                                    value={ctaTextVal}
                                    onChange={e => setCtaTextVal(e.target.value)}
                                    placeholder='e.g. Book Ticket, Book Headset, Reserve Spot'
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Custom label displayed on the event card button (e.g., &quot;Book Headset&quot; for silent parties).
                                </p>
                            </div>

                            {/* Audition Settings */}
                            {isAudition && (
                                <div className="flex flex-col gap-4 p-4 border border-purple-500/20 bg-purple-500/5 rounded-sm">
                                    <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest">Audition Settings</p>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-foreground">Request Applicant Picture</span>
                                            <span className="text-[10px] text-muted-foreground">Applicants must upload a clear photo</span>
                                        </div>
                                        <Toggle checked={requestPicture} onChange={() => setRequestPicture(!requestPicture)} color="purple" />
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-foreground">Don't sell tickets</span>
                                            <span className="text-[10px] text-muted-foreground">Disable ticket sales for this event</span>
                                        </div>
                                        <Toggle
                                            checked={allowNoTickets}
                                            onChange={() => {
                                                const next = !allowNoTickets; setAllowNoTickets(next)
                                                setTicketTypes(next ? [] : initialEventTickets)
                                            }}
                                            color="purple"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Ticket Types */}
                            {!allowNoTickets && (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <SectionLabel>Ticket Types <span className="opacity-50">(max 4)</span></SectionLabel>
                                    </div>
                                    {ticketTypes.map((ticket, index) => (
                                        <div key={index} className="grid grid-cols-[1fr_140px_auto] gap-3 items-center p-3 bg-muted/20 border border-border rounded-sm">
                                            <Input
                                                className="border-border bg-card text-foreground text-sm rounded-md"
                                                value={ticket.name}
                                                onChange={(e) => { const n = [...ticketTypes]; n[index].name = e.target.value; setTicketTypes(n) }}
                                                placeholder="e.g. VIP, Regular"
                                            />
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">₦</span>
                                                <Input
                                                    type="text"
                                                    className="border-border bg-card text-foreground pl-7 pr-10 text-sm rounded-md"
                                                    value={ticket.price === 0 ? "" : formatPrice(ticket.price)}
                                                    onChange={(e) => { const n = [...ticketTypes]; n[index].price = parsePrice(e.target.value); setTicketTypes(n) }}
                                                    placeholder="0"
                                                />
                                                {ticket.price === 0 && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-green-500 font-black">FREE</span>}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { const n = [...ticketTypes]; n.splice(index, 1); setTicketTypes(n) }}
                                                disabled={ticketTypes.length <= 1}
                                                className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {ticketTypes.length < 4 && (
                                        <button
                                            type="button"
                                            onClick={() => setTicketTypes([...ticketTypes, { name: "", price: 0 }])}
                                            className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-400 transition-colors w-fit"
                                        >
                                            <Plus size={13} /> Add Ticket Type
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Event Banner */}
                            <div className="flex flex-col gap-2">
                                <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Event Banner</Label>
                                <div className="w-full min-h-28 border border-dashed border-border bg-muted/10 rounded-sm overflow-hidden">
                                    <FileUpload key={resetKey} onChange={setFiles} />
                                </div>
                            </div>

                            {/* Application Toggle */}
                            <div className="border border-border rounded-sm overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setRequiresApplication(v => !v)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 transition-colors",
                                        requiresApplication ? "bg-orange-500/8" : "bg-card hover:bg-muted/30"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn("h-9 w-9 rounded-sm flex items-center justify-center transition-colors",
                                            requiresApplication ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground")}>
                                            <ClipboardList size={17} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-foreground text-sm">Requires Application</p>
                                            <p className="text-[10px] text-muted-foreground">People must apply before attending</p>
                                        </div>
                                    </div>
                                    <Toggle checked={requiresApplication} onChange={() => setRequiresApplication(v => !v)} />
                                </button>
                                {requiresApplication && (
                                    <div className="p-5 space-y-5 border-t border-border bg-muted/10">
                                        <div className="flex flex-col gap-2">
                                            <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Application Fee</Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">₦</span>
                                                <Input
                                                    type="text"
                                                    className="text-foreground border-border bg-card pl-8 pr-16 rounded-sm"
                                                    value={applicationFeeDisplay}
                                                    onChange={(e) => {
                                                        const raw = e.target.value.replace(/,/g, "")
                                                        if (raw === "") { setApplicationFeeDisplay(""); setApplicationFee(0); return }
                                                        const num = Number(raw)
                                                        if (!isNaN(num)) { setApplicationFee(num); setApplicationFeeDisplay(num.toLocaleString()) }
                                                    }}
                                                    placeholder="0"
                                                />
                                                {applicationFee === 0 && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-green-500 font-black">FREE</span>}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">Set to 0 for a free application process</p>
                                        </div>
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => setShowFormBuilder(v => !v)}
                                                className="flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors"
                                            >
                                                {showFormBuilder ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                                {showFormBuilder ? "Hide" : "Build"} Application Form
                                                {formFields.length > 0 && (
                                                    <span className="bg-orange-500/15 text-orange-500 text-[10px] px-2 py-0.5 rounded-full font-black">
                                                        {formFields.length} {formFields.length === 1 ? "field" : "fields"}
                                                    </span>
                                                )}
                                            </button>
                                            {showFormBuilder && (
                                                <div className="mt-4">
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Design the questions applicants will answer</p>
                                                    <EventFormBuilder fields={formFields} onChange={setFormFields} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <SectionDivider label="Schedule" />

                    {/* ── Section 3: Date + Time (2-col) ── */}
                    <div>
                        <SectionLabel>② When is this event?</SectionLabel>
                        <FieldRow>
                            <div className="flex flex-col gap-2">
                                <ApplyDatePicker
                                    dateValue={dateValue} eventDate={eventDate}
                                    setDateValue={setDateValue} setEventDate={setEventDate}
                                    month={month} setMonth={setMonth}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock size={11} /> Start Time
                                </Label>
                                <Input
                                    className="text-foreground border-border bg-card rounded-sm"
                                    onChange={e => setEventTimeVal(e.target.value)}
                                    value={eventTimeVal}
                                    type="time"
                                    step={1}
                                />
                            </div>
                        </FieldRow>
                    </div>

                </div>

                {/* ── Footer / Submit ── */}
                <div className="py-5 border-t border-border bg-muted/20 flex items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => router.push("/u/dashboard")}
                        className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors lg:hidden"
                    >
                        <X size={14} /> Cancel
                    </button>

                    <div className="flex items-center gap-3 ml-auto">
                        {/* Progress hint */}
                        {!formFilled && (
                            <span className="text-xs text-muted-foreground hidden sm:block">Fill all required fields to continue</span>
                        )}
                        <Button
                            className={cn(
                                "flex items-center gap-2 font-black px-7 rounded-sm text-sm transition-all duration-200",
                                formFilled && !isLoading
                                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25 hover:shadow-orange-500/40"
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                            )}
                            disabled={isLoading || !formFilled}
                            type="submit"
                        >
                            {isLoading ? <><Spinner /> Creating...</> : <>Create Event <ArrowRight size={15} /></>}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default CreateEventForm