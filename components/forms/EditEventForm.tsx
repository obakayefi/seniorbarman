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
        <Card className="w-full border-zinc-800 sm:max-w-xl bg-zinc-950/50 backdrop-blur-xl">
            <form onSubmit={onFormSubmit}>
                <CardContent className="flex flex-col gap-4 pt-6">
                    <div className="flex flex-col gap-2">
                        <Label className="text-gray-400">Event Type</Label>
                        <Select
                            disabled
                            value={currentEventType}
                            onValueChange={(value) => setCurrentEventType(value)}
                        >
                            <SelectTrigger className="w-full text-white border-zinc-800 bg-zinc-900/50">
                                <SelectValue placeholder="Select Event Type" />
                            </SelectTrigger>
                            <SelectContent className={'text-white border-zinc-800 bg-zinc-900'}>
                                <SelectItem value="sports">Sports</SelectItem>
                                <SelectItem value="event">Event</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <section className="mt-4 flex flex-col gap-6">
                        {currentEventType === 'sports' ? (
                            <>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-gray-400">Home Team</Label>
                                    <Select disabled onValueChange={(value) => setHomeTeam(value)} value={homeTeam}>
                                        <SelectTrigger className="w-full text-white border-zinc-800 bg-zinc-900/50 opacity-70">
                                            <SelectValue placeholder='Home' />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800">
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
                                    <Label className="text-gray-400">Away Team</Label>
                                    <Select onValueChange={value => setAwayTeam(value)} value={awayTeam}>
                                        <SelectTrigger className="w-full text-white border-zinc-800 bg-zinc-900/50">
                                            <SelectValue placeholder='Away' />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800">
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
                                    <Label className="text-gray-400">Stadium</Label>
                                    <Select onValueChange={value => setEventVenue(value)} value={eventVenue}>
                                        <SelectTrigger className="w-full text-white border-zinc-800 bg-zinc-900/50">
                                            <SelectValue placeholder='Pick the stadium' />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800">
                                            {STADIUMS.map(stadium => (
                                                <SelectItem key={stadium.name} value={stadium.name}>
                                                    <div className="flex justify-between w-full gap-4">
                                                        <span>{stadium.name}</span>
                                                        <span className="text-xs text-zinc-500">{stadium.state}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-4 border-t border-zinc-800 pt-4">
                                    <Label className="text-gray-400">Ticket Stands</Label>
                                    {ticketTypes.map((ticket, index) => (
                                        <div key={index} className="flex gap-4 items-center">
                                            <Input 
                                                className="text-white flex-1 border-zinc-800 bg-zinc-900/50" 
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
                                                className="text-white w-32 border-zinc-800 bg-zinc-900/50" 
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
                                    <Label className="text-gray-400">Title</Label>
                                    <Input type="text" className={'text-white bg-zinc-900/50 border-zinc-800'} value={eventTitle.value} onChange={eventTitle.onChange} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label className="text-gray-400">Venue</Label>
                                    <Input type="text" className={'text-white bg-zinc-900/50 border-zinc-800'} value={eventVenue} onChange={(e) => setEventVenue(e.target.value)} />
                                </div>
                            </>
                        )}

                        {currentEventType !== 'sports' && (
                            <>
                                <div className="flex flex-col gap-4 border-t border-zinc-800 pt-4">
                                    <Label className="text-gray-400">Ticket Types (Minimum 4)</Label>
                                    {ticketTypes.map((ticket, index) => (
                                        <div key={index} className="flex gap-4 items-center">
                                            <Input 
                                                className="text-white flex-1 border-zinc-800 bg-zinc-900/50" 
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
                                                className="text-white w-32 border-zinc-800 bg-zinc-900/50" 
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
                                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                onClick={() => {
                                                    const newTickets = [...ticketTypes];
                                                    newTickets.splice(index, 1);
                                                    setTicketTypes(newTickets);
                                                }}
                                                disabled={ticketTypes.length <= 4}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-fit border-zinc-700 bg-zinc-100 text-black hover:bg-white font-bold transition-all"
                                        onClick={() => setTicketTypes([...ticketTypes, { name: '', price: 0 }])}
                                    >
                                        Add Ticket Type
                                    </Button>
                                </div>

                                {/* Application Settings */}
                                <div className="border border-zinc-800 rounded-2xl overflow-hidden mt-6">
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
                                            </div>

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
                                                        <EventFormBuilder fields={formFields} onChange={setFormFields} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label className="text-gray-400">Update Banner (Optional)</Label>
                                    <FileUpload key={resetKey} onChange={setFiles} />
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                {/* <Label className="text-gray-400">Date</Label> */}
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
                                <Label className="text-gray-400">Time</Label>
                                <Input className={'text-white bg-zinc-900/50 border-zinc-800'} onChange={eventTime.onChange} value={eventTime.value} type="time" />
                            </div>
                        </div>
                    </section>
                </CardContent>

                <CardFooter className="mt-6 border-t border-zinc-800 pt-6 flex justify-between items-center">
                    <DeleteConfirmModal
                        onConfirm={onDeleteEvent}
                        isDeleting={isSubmitting}
                    />
                    <div className="flex gap-3">
                        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white" disabled={isSubmitting} type="submit">
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
