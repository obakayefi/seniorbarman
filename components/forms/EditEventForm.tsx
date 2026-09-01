"use client"
import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DeleteConfirmModal } from "../modals/delete-confirm-modal";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import {
    Field,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import useInput from "@/hooks/useInput"
import { Label } from "../ui/label"
import { ApplyDatePicker } from "./ApplyDatePicker"
import { Spinner } from "../ui/spinner"
import { CLUBS, STADIUMS } from "@/lib/utils"
import Image from "next/image"
import { useRouter } from "next/navigation";
import { FileUpload } from "../ui/file-upload";
import { ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import EventFormBuilder, { FormField } from "./EventFormBuilder"

interface EditEventFormProps {
    eventId: string
}

function formatDateToInput(dateString: string) {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

const EditEventForm = ({ eventId }: EditEventFormProps) => {
    const router = useRouter()
    const [currentEventType, setCurrentEventType] = React.useState('sports')
    const [eventDate, setEventDate] = React.useState<Date | undefined>(undefined)
    const [month, setMonth] = React.useState<Date | undefined>(undefined)
    const [dateValue, setDateValue] = React.useState<Date | undefined>(undefined)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [homeTeam, setHomeTeam] = React.useState('')
    const [awayTeam, setAwayTeam] = React.useState('')
    const [ticketTypes, setTicketTypes] = React.useState<{name: string, price: number}[]>([])
    const [eventVenue, setEventVenue] = React.useState('')
    const [files, setFiles] = React.useState<File[]>([])
    const [teams, setTeams] = React.useState<any[]>([])

    const eventTitle = useInput('')
    const eventTime = useInput('16:00')
    const ctaTextInput = useInput('Book Ticket')

    // Application Settings
    const [requiresApplication, setRequiresApplication] = React.useState(false)
    const [applicationFee, setApplicationFee] = React.useState(0)
    const [applicationFeeDisplay, setApplicationFeeDisplay] = React.useState("")
    const [formFields, setFormFields] = React.useState<FormField[]>([])
    const [showFormBuilder, setShowFormBuilder] = React.useState(false)

    const [resetKey, setResetKey] = React.useState(0)

    React.useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await fetch("/api/teams")
                const data = await res.json()
                if (data.success) {
                    setTeams(data.teams)
                }
            } catch (error) {
                console.error("Failed to fetch teams:", error)
            }
        }
        fetchTeams()
    }, [])

    React.useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`/api/events/${eventId}`)
                if (!res.ok) throw new Error("Failed to fetch event")
                const data = await res.json()

                setCurrentEventType(data.type)
                setHomeTeam(data.homeTeam || '')
                setAwayTeam(data.awayTeam || '')
                eventTitle.setValue(data.title || '')
                eventTime.setValue(data.time || '16:00')
                ctaTextInput.setValue(data.ctaText || 'Book Ticket')
                setTicketTypes(data.ticketTypes || [])
                setEventVenue(data.venue || '')

                if (data.date) {
                    const parsedDate = new Date(data.date)
                    setEventDate(parsedDate)
                    setMonth(parsedDate)
                    setDateValue(parsedDate)

                    // Extract time from date
                    const hours = parsedDate.getHours().toString().padStart(2, '0');
                    const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
                    eventTime.setValue(`${hours}:${minutes}`);
                }

                // Application settings
                setRequiresApplication(data.requiresApplication || false)
                setApplicationFee(data.applicationFee || 0)
                setApplicationFeeDisplay((data.applicationFee || 0).toLocaleString())
                setFormFields(data.formFields || [])
            } catch (error) {
                console.error("Error fetching event:", error)
                toast.error("Failed to load event data")
            } finally {
                setIsLoading(false)
            }
        }
        fetchEvent()
    }, [eventId])

    const onFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData();
        if (files[0]) {
            formData.append("imageFile", files[0]);
        }

        formData.append("eventType", currentEventType);
        formData.append("eventTime", eventTime.value);
        formData.append("eventVenue", eventVenue);
        formData.append("ctaText", ctaTextInput.value.trim() || 'Book Ticket');
        formData.append("ticketTypes", JSON.stringify(ticketTypes));
        if (eventDate) {
            formData.append("eventDate", eventDate.toISOString());
        }

        formData.append("requiresApplication", String(requiresApplication));
        formData.append("applicationFee", String(applicationFee));
        formData.append("formFields", JSON.stringify(formFields));

        if (currentEventType === "sports") {
            formData.append("homeTeam", homeTeam);
            formData.append("awayTeam", awayTeam);
        } else {
            formData.append("eventTitle", eventTitle.value);
        }

        try {
            const res = await fetch(`/api/events/${eventId}`, {
                method: "PATCH",
                body: formData
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to update event");

            toast.success('🥳 Event updated successfully')
            router.push('/u/dashboard')
        } catch (error: any) {
            console.error('Error updating form:', error)
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const onDeleteEvent = async () => {
        // if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/events/${eventId}?type=${currentEventType}`, {
                method: "DELETE"
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to delete event")

            toast.success("Event deleted successfully")
            router.push('/u/dashboard')
        } catch (error: any) {
            console.error("Error deleting event:", error)
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return <div className="flex justify-center p-20"><Spinner /></div>
    }

    return (
        <Card className="w-full sm:max-w-xl">
            <form onSubmit={onFormSubmit}>
                <CardContent className="flex flex-col gap-4 pt-2">
                    <div className="flex flex-col gap-2">
                        <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Event Type</Label>
                        <Select
                            disabled
                            value={currentEventType}
                            onValueChange={(value) => setCurrentEventType(value)}
                        >
                            <SelectTrigger className="w-full text-foreground border-border bg-card rounded-sm">
                                <SelectValue placeholder="Select Event Type" />
                            </SelectTrigger>
                            <SelectContent className={'border-border'}>
                                <SelectItem value="sports">Sports</SelectItem>
                                <SelectItem value="event">Event</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <section className="mt-4 flex flex-col gap-6">
                        {currentEventType === 'sports' ? (
                            <>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Home Team</Label>
                                    <Select disabled onValueChange={(value) => setHomeTeam(value)} value={homeTeam}>
                                        <SelectTrigger className="w-full text-foreground border-border bg-card rounded-sm opacity-70">
                                            <SelectValue placeholder='Home' />
                                        </SelectTrigger>
                                        <SelectContent className="border-border">
                                            {teams.map(team => (
                                                <SelectItem key={team._id} value={team._id}>
                                                    <div className="flex gap-2 items-center">
                                                        <Image src={team.logo || "/clubs/rangers-logo.png"} alt="team logo" width={24} height={24} className="rounded-full object-cover" />
                                                        <span>{team.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Away Team</Label>
                                    <Select onValueChange={value => setAwayTeam(value)} value={awayTeam}>
                                        <SelectTrigger className="w-full text-foreground border-border bg-card rounded-sm">
                                            <SelectValue placeholder='Away' />
                                        </SelectTrigger>
                                        <SelectContent className="border-border">
                                            {teams.map(team => (
                                                <SelectItem key={team._id} value={team._id}>
                                                    <div className="flex gap-2 items-center">
                                                        <Image src={team.logo || "/clubs/rangers-logo.png"} alt="team logo" width={24} height={24} className="rounded-full object-cover" />
                                                        <span>{team.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Stadium</Label>
                                    <Select onValueChange={value => setEventVenue(value)} value={eventVenue}>
                                        <SelectTrigger className="w-full text-foreground border-border bg-card rounded-sm">
                                            <SelectValue placeholder='Pick the stadium' />
                                        </SelectTrigger>
                                        <SelectContent className="border-border">
                                            {STADIUMS.map(stadium => (
                                                <SelectItem key={stadium.name} value={stadium.name}>
                                                    <div className="flex justify-between w-full gap-4">
                                                        <span>{stadium.name}</span>
                                                        <span className="text-xs text-muted-foreground">{stadium.state}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-4 border-t border-border pt-4">
                                    <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Ticket Stands</Label>
                                    {ticketTypes.map((ticket, index) => (
                                        <div key={index} className="flex gap-4 items-center">
                                            <Input 
                                                className="text-foreground flex-1 border-border bg-card rounded-sm" 
                                                value={ticket.name} 
                                                onChange={(e) => {
                                                    const newTickets = [...ticketTypes];
                                                    newTickets[index].name = e.target.value;
                                                    setTicketTypes(newTickets);
                                                }} 
                                                placeholder="Stand Name" 
                                            />
                                            <Input 
                                                type="number" 
                                                min={0}
                                                className="text-foreground w-32 border-border bg-card rounded-sm" 
                                                value={ticket.price === 0 ? '' : ticket.price} 
                                                onChange={(e) => {
                                                    const newTickets = [...ticketTypes];
                                                    newTickets[index].price = Number(e.target.value) || 0;
                                                    setTicketTypes(newTickets);
                                                }} 
                                                placeholder="Price (₦)" 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Title</Label>
                                    <Input type="text" className={'text-foreground bg-card border-border rounded-sm'} value={eventTitle.value} onChange={eventTitle.onChange} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Venue</Label>
                                    <Input type="text" className={'text-foreground bg-card border-border rounded-sm'} value={eventVenue} onChange={(e) => setEventVenue(e.target.value)} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Button Action Text (CTA)</Label>
                                        <span className="text-[10px] text-muted-foreground">Default: &quot;Book Ticket&quot;</span>
                                    </div>
                                    <Input 
                                        type="text" 
                                        className={'text-foreground bg-card border-border rounded-sm'} 
                                        value={ctaTextInput.value} 
                                        onChange={ctaTextInput.onChange} 
                                        placeholder='e.g. Book Ticket, Book Headset, Reserve Spot'
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Custom label displayed on the event card button (e.g., &quot;Book Headset&quot; for silent parties).
                                    </p>
                                </div>
                            </>
                        )}

                        {currentEventType !== 'sports' && (
                            <>
                                <div className="flex flex-col gap-4 border-t border-border pt-4">
                                    <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Ticket Types</Label>
                                    {ticketTypes.map((ticket, index) => (
                                        <div key={index} className="flex gap-4 items-center">
                                            <Input 
                                                className="text-foreground flex-1 border-border bg-card rounded-sm" 
                                                value={ticket.name} 
                                                onChange={(e) => {
                                                    const newTickets = [...ticketTypes];
                                                    newTickets[index].name = e.target.value;
                                                    setTicketTypes(newTickets);
                                                }} 
                                                placeholder="Ticket Name (e.g., Regular, VIP)" 
                                            />
                                            <Input 
                                                type="number" 
                                                min={0}
                                                className="text-foreground w-32 border-border bg-card rounded-sm" 
                                                value={ticket.price === 0 ? '' : ticket.price} 
                                                onChange={(e) => {
                                                    const newTickets = [...ticketTypes];
                                                    newTickets[index].price = Number(e.target.value) || 0;
                                                    setTicketTypes(newTickets);
                                                }} 
                                                placeholder="Price (₦)" 
                                            />
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-sm"
                                                onClick={() => {
                                                    const newTickets = [...ticketTypes];
                                                    newTickets.splice(index, 1);
                                                    setTicketTypes(newTickets);
                                                }}
                                                disabled={ticketTypes.length <= 1}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-fit border-border bg-muted hover:bg-muted/80 text-foreground font-bold transition-all rounded-sm text-xs"
                                        onClick={() => setTicketTypes([...ticketTypes, { name: '', price: 0 }])}
                                    >
                                        Add Ticket Type
                                    </Button>
                                </div>

                                {/* Application Settings */}
                                <div className="border border-border rounded-sm overflow-hidden mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setRequiresApplication(v => !v)}
                                        className={`w-full flex items-center justify-between p-4 transition-colors ${
                                            requiresApplication ? "bg-orange-500/10" : "bg-card hover:bg-muted/30"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`h-9 w-9 rounded-sm flex items-center justify-center ${
                                                requiresApplication ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                                            }`}>
                                                <ClipboardList size={18} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-black text-foreground text-sm">Requires Application</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    People must apply before attending
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`relative w-11 h-6 rounded-sm transition-colors shrink-0 ${
                                            requiresApplication ? "bg-orange-500" : "bg-muted-foreground/25"
                                        }`}>
                                            <span className={`absolute top-1 left-1 h-4 w-4 rounded-sm bg-white transition-transform ${
                                                requiresApplication ? "translate-x-5" : "translate-x-0"
                                            }`} />
                                        </div>
                                    </button>

                                    {requiresApplication && (
                                        <div className="p-5 space-y-5 border-t border-border bg-muted/10">
                                            <div className="space-y-2">
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
                                            </div>

                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowFormBuilder(v => !v)}
                                                    className="flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
                                                >
                                                    {showFormBuilder ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    {showFormBuilder ? "Hide" : "Build"} Application Form
                                                    {formFields.length > 0 && (
                                                        <span className="bg-orange-500/20 text-orange-500 text-[10px] px-2 py-0.5 rounded-full font-black">
                                                            {formFields.length} {formFields.length === 1 ? "field" : "fields"}
                                                        </span>
                                                    )}
                                                </button>

                                                {showFormBuilder && (
                                                    <div className="mt-4">
                                                        <EventFormBuilder fields={formFields} onChange={setFormFields} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Update Banner (Optional)</Label>
                                    <FileUpload key={resetKey} onChange={setFiles} />
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <ApplyDatePicker
                                    dateValue={dateValue}
                                    eventDate={eventDate}
                                    setDateValue={setDateValue}
                                    setEventDate={setEventDate}
                                    month={month}
                                    setMonth={setMonth}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-muted-foreground text-xs font-black uppercase tracking-widest">Time</Label>
                                <Input className={'text-foreground bg-card border-border rounded-sm'} onChange={eventTime.onChange} value={eventTime.value} type="time" />
                            </div>
                        </div>
                    </section>
                </CardContent>

                <CardFooter className="mt-6 border-t border-border pt-6 flex justify-between items-center px-0">
                    <DeleteConfirmModal
                        onConfirm={onDeleteEvent}
                        isDeleting={isSubmitting}
                    />
                    <div className="flex gap-3">
                        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting} className="rounded-sm">
                            Cancel
                        </Button>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-sm" disabled={isSubmitting} type="submit">
                            {isSubmitting && <Spinner className="mr-2" />}
                            Update Event
                        </Button>
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}

export default EditEventForm
