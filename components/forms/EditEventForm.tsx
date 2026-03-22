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
    const [regularPrice, setRegularPrice] = React.useState('')
    const [vipPrice, setVipPrice] = React.useState('')
    const [eventVenue, setEventVenue] = React.useState('')
    const [files, setFiles] = React.useState<File[]>([])

    const eventTitle = useInput('')
    const eventTime = useInput('16:00')

    const [resetKey, setResetKey] = React.useState(0)

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
                setRegularPrice(String(data.regularPrice || ''))
                setVipPrice(String(data.vipPrice || ''))
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
        formData.append("regularPrice", regularPrice);
        formData.append("vipPrice", vipPrice);
        if (eventDate) {
            formData.append("eventDate", eventDate.toISOString());
        }

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
                                    <Select onValueChange={(value) => setHomeTeam(value)} value={homeTeam}>
                                        <SelectTrigger className="w-full text-white border-zinc-800 bg-zinc-900/50">
                                            <SelectValue placeholder='Home' />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800">
                                            {CLUBS.map(club => (
                                                <SelectItem key={club.name} value={club.name}>
                                                    <div className="flex gap-2 items-center">
                                                        <Image src={club.icon} alt="club icon" width={24} height={24} />
                                                        <span>{club.name}</span>
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
                                            {CLUBS.map(club => (
                                                <SelectItem key={club.name} value={club.name}>
                                                    <div className="flex gap-2 items-center">
                                                        <Image src={club.icon} alt="club icon" width={24} height={24} />
                                                        <span>{club.name}</span>
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-gray-400">Regular Price</Label>
                                        <Input type="number" className={'text-white bg-zinc-900/50 border-zinc-800'} value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-gray-400">VIP Price</Label>
                                        <Input type="number" className={'text-white bg-zinc-900/50 border-zinc-800'} value={vipPrice} onChange={(e) => setVipPrice(e.target.value)} />
                                    </div>
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
