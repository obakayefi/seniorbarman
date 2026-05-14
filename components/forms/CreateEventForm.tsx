"use client"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Card, CardContent, CardFooter,
} from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupText } from "@/components/ui/input-group"
import useInput from "@/hooks/useInput"
import { Label } from "../ui/label"
import { ApplyDatePicker } from "./ApplyDatePicker"
import { Spinner } from "../ui/spinner"
import { CLUBS, STADIUMS } from "@/lib/utils"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FileUpload } from "../ui/file-upload"
import { useApp } from "@/context/AppContext"
import EventFormBuilder, { FormField } from "./EventFormBuilder"
import { ChevronDown, ChevronUp, ClipboardList } from "lucide-react"

function formatDate(date: Date | undefined) {
    if (!date) return ""
    return date.toLocaleDateString("en-US", {
        weekday: "short", month: "long", day: "numeric", year: "numeric",
    }).replace(/,/g, "")
}

function isValidDate(date: Date | undefined) {
    if (!date) return false
    return !isNaN(date.getTime())
}

const CreateEventForm = () => {
    const router = useRouter()
    const { user } = useApp()
    const isOrganizer = user?.role === "organizer"

    const [currentEventType, setCurrentEventType] = useState(isOrganizer ? "event" : "sports")
    const [eventDate, setEventDate] = useState<Date | undefined>(undefined)
    const [month, setMonth] = useState<Date | undefined>(undefined)
    const [dateValue, setDateValue] = useState<Date | undefined>(undefined)

    useEffect(() => {
        const now = new Date()
        setEventDate(now); setMonth(now); setDateValue(now)
    }, [])

    // --- Ticket Types ---
    const initialSportsTickets = [
        { name: "Popular Stand", price: 0 },
        { name: "Regular Stand", price: 0 },
        { name: "Executive Stand", price: 0 },
    ]
    const initialEventTickets = [{ name: "Regular", price: 0 }]
    const [ticketTypes, setTicketTypes] = useState<{ name: string; price: number }[]>(
        isOrganizer ? initialEventTickets : initialSportsTickets
    )

    useEffect(() => {
        if (user?.role === "organizer") {
            setCurrentEventType("event")
            setTicketTypes(initialEventTickets)
        }
    }, [user?.role])

    // --- Audition Settings ---
    const [isAudition, setIsAudition] = useState(false)
    const [requestPicture, setRequestPicture] = useState(false)
    const [allowNoTickets, setAllowNoTickets] = useState(false)

    // --- Application Settings ---
    const [requiresApplication, setRequiresApplication] = useState(false)
    const [applicationFee, setApplicationFee] = useState(0)
    const [applicationFeeDisplay, setApplicationFeeDisplay] = useState("")
    const [formFields, setFormFields] = useState<FormField[]>([])
    const [showFormBuilder, setShowFormBuilder] = useState(false)

    useEffect(() => {
        if (isAudition) {
            setRequiresApplication(true)
            setShowFormBuilder(true)
        }
    }, [isAudition])

    // --- Other form state ---
    const [isLoading, setIsLoading] = useState(false)
    const [homeTeam, setHomeTeam] = useState("Rangers International FC")
    const [awayTeam, setAwayTeam] = useState("")
    const [eventVenue, setEventVenue] = useState("")
    const [files, setFiles] = useState<File[]>([])
    const eventTitle = useInput("")
    const eventTime = useInput("16:00")
    const [resetKey, setResetKey] = useState(0)

    // --- Price formatting helpers ---
    const formatPrice = (price: number) => {
        if (price === 0) return ""
        return price.toLocaleString()
    }
    const parsePrice = (value: string) => {
        const cleaned = value.replace(/,/g, "")
        return Number(cleaned) || 0
    }

    const formReset = (type: string = currentEventType) => {
        setAwayTeam(""); eventTime.reset(); eventTitle.reset()
        setEventDate(undefined); setDateValue(undefined); setMonth(undefined)
        setFiles([]); setResetKey(prev => prev + 1)
        setRequiresApplication(false); setApplicationFee(0)
        setApplicationFeeDisplay(""); setFormFields([]); setShowFormBuilder(false)
        setIsAudition(false); setRequestPicture(false); setAllowNoTickets(false)

        if (type === "sports") {
            setHomeTeam("Rangers International FC")
            setEventVenue("Nnamdi Azikiwe Stadium")
            setTicketTypes(initialSportsTickets)
        } else {
            setHomeTeam(""); setEventVenue("")
            setTicketTypes(initialEventTickets)
        }
    }

    const onFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const combinedDate = eventDate ? new Date(eventDate) : undefined
        if (combinedDate && eventTime.value) {
            const [h, m] = eventTime.value.split(":").map(Number)
            if (!isNaN(h) && !isNaN(m)) combinedDate.setHours(h, m, 0, 0)
        }

        const eventDetails = {
            eventType: currentEventType ?? "N/A",
            homeTeam, awayTeam, eventVenue,
            eventTitle: eventTitle.value ?? "N/A",
            eventDate: combinedDate,
            imageFile: files[0],
            eventTime: eventTime.value,
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
            if (!eventTitle.value) { toast.error("Please enter an event title"); setIsLoading(false); return }
            if (ticketTypes.length < 1) { toast.error("Please add at least 1 ticket type"); setIsLoading(false); return }
            if (ticketTypes.some(t => !t.name || t.price < 0)) { toast.error("Please fill in all ticket types properly"); setIsLoading(false); return }

            // Validate application form if enabled
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
            if (!res.ok) {
                toast.error(data.error || data.details || "Failed to create event")
                throw new Error(data.error || "Failed to create event")
            }
            toast.success("🥳 Event created successfully")
        } catch (error) {
            if (error instanceof Error) toast.error(error.message)
        } finally {
            setIsLoading(false)
            formReset()
        }
    }

    const formFilled = useMemo(() => {
        if (!eventDate || !eventTime.value || !eventVenue) return false
        if (currentEventType === "sports") {
            return Boolean(homeTeam && awayTeam && ticketTypes.every(t => t.name && t.price >= 0))
        }
        return Boolean(eventTitle.value && ticketTypes.every(t => t.name && t.price >= 0) && ticketTypes.length >= 1 && files.length > 0)
    }, [currentEventType, eventDate, eventTime.value, eventVenue, ticketTypes, files, homeTeam, awayTeam, eventTitle.value])

    return (
        <Card className="w-full border-zinc-800 sm:max-w-xl">
            <div className="p-6 h-24">
                <h1 className="text-4xl text-left text-white">Create Event</h1>
                <p className="text-amber-500">Events you create here can be shown on the homepage</p>
            </div>
            <div className="bg-zinc-800 mb-4 h-px" />
            <form onSubmit={onFormSubmit}>
                <CardContent className="flex flex-col gap-4">

                    {/* Event Type Selector */}
                    <Select
                        value={isAudition ? "audition" : currentEventType}
                        onValueChange={(v) => {
                            if (v === "audition") {
                                formReset("event");
                                setIsAudition(true);
                                setCurrentEventType("event");
                            } else {
                                formReset(v);
                                setIsAudition(false);
                                setCurrentEventType(v);
                            }
                        }}
                    >
                        <SelectTrigger className="w-full text-white border-zinc-800">
                            <SelectValue placeholder="Select Event Type" />
                        </SelectTrigger>
                        <SelectContent className="text-white border-zinc-800">
                            {!isOrganizer && <SelectItem value="sports">Sports</SelectItem>}
                            <SelectItem value="event">Regular Event</SelectItem>
                            <SelectItem value="audition">Audition</SelectItem>
                        </SelectContent>
                    </Select>

                    <section className="mt-4 flex flex-col gap-10">
                        {currentEventType === "sports" ? (
                            <>
                                {/* Home Team */}
                                <div className="flex flex-col gap-2">
                                    <Label className="text-gray-400">Home Team</Label>
                                    <Select onValueChange={setHomeTeam} value={homeTeam}>
                                        <SelectTrigger className="w-full text-white border-zinc-800"><SelectValue placeholder="Home" /></SelectTrigger>
                                        <SelectContent className="border-red-800">
                                            {CLUBS.map((club, idx) => (
                                                <SelectItem key={club.name + idx} value={club.name}>
                                                    <Image src={club.icon} alt="club icon" width={32} height={100} />
                                                    <span>{club.name}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Away Team */}
                                <div className="flex flex-col gap-2">
                                    <Label className="text-gray-400">Away Team</Label>
                                    <Select onValueChange={setAwayTeam} value={awayTeam}>
                                        <SelectTrigger className="w-full text-white border-zinc-800"><SelectValue placeholder="Away" /></SelectTrigger>
                                        <SelectContent className="w-full">
                                            {CLUBS.map((club, idx) => (
                                                <SelectItem key={club.name + idx} value={club.name}>
                                                    <div className="flex gap-4 items-center w-full">
                                                        <Image src={club.icon} alt="club icon" width={32} height={100} />
                                                        <span>{club.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Stadium */}
                                <div className="flex flex-col gap-2">
                                    <Label className="text-gray-400">Stadium</Label>
                                    <Select onValueChange={setEventVenue} value={eventVenue}>
                                        <SelectTrigger className="w-full text-white border-zinc-800"><SelectValue placeholder="Pick the stadium" /></SelectTrigger>
                                        <SelectContent>
                                            {STADIUMS.map((s, idx) => (
                                                <SelectItem key={s.name + idx} value={s.name}>
                                                    <span>{s.name}</span>
                                                    <span className="bg-slate-200 py-1 px-3 rounded text-xs text-slate-900 ml-2">{s.state}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sports Ticket Stands */}
                                <div className="flex flex-col gap-4 border-t border-zinc-800 pt-4">
                                    <Label className="text-gray-400">Ticket Stands</Label>
                                    {ticketTypes.map((ticket, index) => (
                                        <div key={index} className="flex gap-4 items-center">
                                            <Input className="text-white flex-1 border-zinc-800 bg-zinc-900/50" value={ticket.name}
                                                onChange={(e) => { const n = [...ticketTypes]; n[index].name = e.target.value; setTicketTypes(n) }}
                                                placeholder="Stand Name" />
                                            <div className="relative w-32">
                                                <Input type="text" className="text-white w-full border-zinc-800 bg-zinc-900/50 pr-8"
                                                    value={ticket.price === 0 ? "" : formatPrice(ticket.price)}
                                                    onChange={(e) => { const n = [...ticketTypes]; n[index].price = parsePrice(e.target.value); setTicketTypes(n) }}
                                                    placeholder="Price (₦)" />
                                                {ticket.price === 0 && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-green-500 font-bold">FREE</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Title */}
                                <div className="flex flex-col gap-2">
                                    <Label className="text-gray-400">Title</Label>
                                    <Input type="text" className="text-white" value={eventTitle.value} onChange={eventTitle.onChange} />
                                </div>

                                {/* Venue */}
                                <div className="flex flex-col gap-2">
                                    <Label className="text-gray-400">Venue</Label>
                                    <Input type="text" className="text-white bg-zinc-900/50 border-zinc-800" value={eventVenue}
                                        onChange={(e) => setEventVenue(e.target.value)} />
                                </div>

                                {isAudition && (
                                    <div className="flex flex-col gap-4 p-4 border border-blue-500/20 bg-blue-500/5 rounded-2xl">
                                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Audition Settings</p>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <Label className="text-white text-sm">Request Applicant Picture</Label>
                                                <span className="text-[10px] text-zinc-500">Applicants must upload a clear photo of themselves</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setRequestPicture(!requestPicture)}
                                                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${requestPicture ? "bg-blue-500" : "bg-zinc-700"}`}
                                            >
                                                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${requestPicture ? "translate-x-5" : "translate-x-0"}`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <Label className="text-white text-sm">Don't sell tickets</Label>
                                                <span className="text-[10px] text-zinc-500">Disable ticket generation and sales for this event</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setAllowNoTickets(!allowNoTickets)}
                                                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${allowNoTickets ? "bg-blue-500" : "bg-zinc-700"}`}
                                            >
                                                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${allowNoTickets ? "translate-x-5" : "translate-x-0"}`} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Event Ticket Types */}
                                {!allowNoTickets && (
                                    <div className="flex flex-col gap-4 border-t border-zinc-800 pt-4">
                                        <Label className="text-gray-400">Ticket Types (Max 4)</Label>
                                        {ticketTypes.map((ticket, index) => (
                                            <div key={index} className="flex gap-4 items-center">
                                                <Input className="text-white flex-1 border-zinc-800 bg-zinc-900/50"
                                                    value={ticket.name}
                                                    onChange={(e) => { const n = [...ticketTypes]; n[index].name = e.target.value; setTicketTypes(n) }}
                                                    placeholder="Ticket Name (e.g., Regular, VIP)" />
                                                <div className="relative w-32">
                                                    <Input type="text" className="text-white w-full border-zinc-800 bg-zinc-900/50 pr-8"
                                                        value={ticket.price === 0 ? "" : formatPrice(ticket.price)}
                                                        onChange={(e) => { const n = [...ticketTypes]; n[index].price = parsePrice(e.target.value); setTicketTypes(n) }}
                                                        placeholder="Price (₦)" />
                                                    {ticket.price === 0 && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-green-500 font-bold">FREE</span>}
                                                </div>
                                                <Button type="button" variant="ghost"
                                                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                    onClick={() => { const n = [...ticketTypes]; n.splice(index, 1); setTicketTypes(n) }}
                                                    disabled={ticketTypes.length <= 1}>
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                        {ticketTypes.length < 4 && (
                                            <Button type="button" variant="outline"
                                                className="w-fit border-zinc-700 bg-zinc-100 text-black hover:bg-white font-bold transition-all"
                                                onClick={() => setTicketTypes([...ticketTypes, { name: "", price: 0 }])}>
                                                Add Ticket Type
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Event Banner */}
                                <div className="flex flex-col gap-2">
                                    <Label className="text-gray-400">Event Banner</Label>
                                    <div className="w-full max-w-4xl mx-auto min-h-30 border border-dashed bg-black border-zinc-800 rounded-lg">
                                        <FileUpload key={resetKey} onChange={setFiles} />
                                    </div>
                                </div>

                                {/* ─── Application / Registration Toggle ─── */}
                                <div className="border border-zinc-800 rounded-2xl overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setRequiresApplication(v => !v)}
                                        className={`w-full flex items-center justify-between p-4 transition-colors ${
                                            requiresApplication ? "bg-orange-500/10" : "bg-zinc-900/40 hover:bg-zinc-900/60"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                                                requiresApplication ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-500"
                                            }`}>
                                                <ClipboardList size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-white text-sm">Requires Application</p>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                                                    People must apply before attending
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                                            requiresApplication ? "bg-orange-500" : "bg-zinc-700"
                                        }`}>
                                            <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                                                requiresApplication ? "translate-x-5" : "translate-x-0"
                                            }`} />
                                        </div>
                                    </button>

                                    {requiresApplication && (
                                        <div className="p-5 space-y-5 border-t border-zinc-800 bg-zinc-950/40">
                                            {/* Application Fee */}
                                            <div className="space-y-2">
                                                <Label className="text-zinc-400">Application Fee</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-bold">₦</span>
                                                    <Input
                                                        type="text"
                                                        className="text-white border-zinc-800 bg-zinc-900/50 pl-8 pr-16"
                                                        value={applicationFeeDisplay}
                                                        onChange={(e) => {
                                                            const raw = e.target.value.replace(/,/g, "")
                                                            if (raw === "") { setApplicationFeeDisplay(""); setApplicationFee(0); return }
                                                            const num = Number(raw)
                                                            if (!isNaN(num)) {
                                                                setApplicationFee(num)
                                                                setApplicationFeeDisplay(num.toLocaleString())
                                                            }
                                                        }}
                                                        placeholder="0"
                                                    />
                                                    {applicationFee === 0 && (
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-green-500 font-black">FREE</span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-zinc-600">Set to 0 for a free application process</p>
                                            </div>

                                            {/* Form Builder Toggle */}
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowFormBuilder(v => !v)}
                                                    className="flex items-center gap-2 text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors"
                                                >
                                                    {showFormBuilder ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    {showFormBuilder ? "Hide" : "Build"} Application Form
                                                    {formFields.length > 0 && (
                                                        <span className="bg-orange-500/20 text-orange-400 text-[10px] px-2 py-0.5 rounded-full font-black">
                                                            {formFields.length} {formFields.length === 1 ? "field" : "fields"}
                                                        </span>
                                                    )}
                                                </button>

                                                {showFormBuilder && (
                                                    <div className="mt-4">
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">
                                                            Design the questions applicants will answer
                                                        </p>
                                                        <EventFormBuilder fields={formFields} onChange={setFormFields} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Date Picker */}
                        <div className="flex flex-col gap-2">
                            <ApplyDatePicker
                                dateValue={dateValue} eventDate={eventDate}
                                setDateValue={setDateValue} setEventDate={setEventDate}
                                month={month} setMonth={setMonth}
                            />
                        </div>

                        {/* Time */}
                        <div className="flex flex-col gap-2">
                            <Label className="text-gray-400">Time</Label>
                            <Input className="text-white" onChange={eventTime.onChange} value={eventTime.value} type="time" step={1} />
                        </div>
                    </section>
                </CardContent>

                <CardFooter className="mt-10 border-t-2 border-zinc-800 pt-8 flex items-end justify-end">
                    <Field orientation="horizontal" className="flex justify-end">
                        <Button type="button" variant="outline" onClick={() => router.push("/u/dashboard")}>Cancel</Button>
                        <Button className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600" disabled={isLoading || !formFilled} type="submit">
                            {isLoading && <Spinner />} Submit
                        </Button>
                    </Field>
                </CardFooter>
            </form>
        </Card>
    )
}

export default CreateEventForm