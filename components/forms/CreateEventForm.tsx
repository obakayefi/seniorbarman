"use client"
import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group"
import { EventFormData, eventSchema } from "@/lib/zodSchemas"
import useInput from "@/hooks/useInput"
import { Label } from "../ui/label"
import { ApplyDatePicker } from "./ApplyDatePicker"
import { Spinner } from "../ui/spinner"
import { CLUBS, STADIUMS } from "@/lib/utils"
import Image from "next/image"
import { useRouter } from "next/navigation";
import { FileUpload } from "../ui/file-upload";

function formatDate(date: Date | undefined) {
    if (!date) {
        return ""
    }

    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).replace(/,/g, '') // match Exactly "Sun March 15 2026"
}

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false
    }
    return !isNaN(date.getTime())
}

const CreateEventForm = () => {
    const router = useRouter()
    const [currentEventType, setCurrentEventType] = React.useState('sports')
    // const [eventDate, setEventDate] = React.useState<Date | undefined>(new Date(Date.now()))
    const [eventDate, setEventDate] = React.useState<Date | undefined>(undefined)
    const [month, setMonth] = React.useState<Date | undefined>(undefined)
    const [dateValue, setDateValue] = React.useState<Date | undefined>(undefined)

    React.useEffect(() => {
        const now = new Date()
        setEventDate(now)
        setMonth(now)
        setDateValue(now)
    }, [])
    const [isLoading, setIsLoading] = React.useState(false)
    const [homeTeam, setHomeTeam] = React.useState('Rangers International FC')
    const [awayTeam, setAwayTeam] = React.useState('')
    const [regularPrice, setRegularPrice] = React.useState('')
    const [vipPrice, setVipPrice] = React.useState('')
    const [eventVenue, setEventVenue] = React.useState('Nnamdi Azikiwe Stadium')
    const [files, setFiles] = React.useState<File[]>([])
    // const [eventTime, setEventTime] = React.useState("16:00")
    // const [awayTeam, setAwayTeam] = React.useState('')
    const eventType = useInput('')
    // const homeTeam = useInput('')
    // const awayTeam = useInput('')
    const eventTitle = useInput('')
    const eventTime = useInput('16:00')
    // const eventDate = useInput('')
    // const eventVenue = useInput('')

    const [resetKey, setResetKey] = React.useState(0)

    const formReset = (type: string = currentEventType) => {
        setAwayTeam('')
        eventTime.reset()
        eventTitle.reset()
        setRegularPrice('')
        setVipPrice('')
        setEventDate(undefined)
        setDateValue(undefined)
        setMonth(undefined)
        setFiles([])
        setResetKey(prev => prev + 1)

        if (type === 'sports') {
            setHomeTeam('Rangers International FC')
            setEventVenue('Nnamdi Azikiwe Stadium')
        } else {
            setHomeTeam('')
            setEventVenue('')
        }
    }

    const onFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const combinedDate = eventDate ? new Date(eventDate) : undefined;
        if (combinedDate && eventTime.value) {
            const [hours, minutes] = eventTime.value.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes)) {
                combinedDate.setHours(hours, minutes, 0, 0);
            }
        }

        const eventDetails = {
            eventType: currentEventType ?? "N/A",
            homeTeam,
            awayTeam,
            eventVenue,
            eventTitle: eventTitle.value ?? "N/A",
            eventDate: combinedDate,
            imageFile: files[0],
            eventTime: eventTime.value,
            regularPrice,
            vipPrice,
        }

        const formData = new FormData();

        if (eventDetails.imageFile) {
            formData.append("imageFile", eventDetails.imageFile);
        }

        if (currentEventType === "sports") {
            const { eventTitle, imageFile, ...data } = eventDetails
            Object.entries(data).forEach(([key, value]) => {
                if (value === null || value === undefined) {
                    return; // Skip null/undefined values
                }
                if (value instanceof Date) {
                    formData.append(key, value.toISOString());
                } else {
                    formData.append(key, String(value));
                }
            });
        }

        if (currentEventType === "event") {
            if (!eventDate) {
                toast.error("Please select an event date");
                setIsLoading(false);
                return;
            }

            if (!eventTitle.value) {
                toast.error("Please enter an event title");
                setIsLoading(false);
                return;
            }

            const { homeTeam, awayTeam, imageFile, ...data } = eventDetails
            Object.entries(data).forEach(([key, value]) => {
                if (value === null || value === undefined) {
                    return; // Skip null/undefined values
                }
                if (value instanceof Date) {
                    formData.append(key, value.toISOString());
                } else {
                    formData.append(key, String(value));
                }
            });
        }

        try {
            const res = await fetch("/api/events", {
                method: "POST",
                body: formData
            })

            const data = await res.json()
            if (!res.ok) {
                console.error('API Error Response:', data);
                toast.error(data.error || data.details || "Failed to create event");
                throw new Error(data.error || "Failed to create event");
            }
            // console.log("Event created: ", data)
            toast.success('🥳 Event created successfully')
        } catch (error) {
            console.error('Error submitting form:', error)
            if (error instanceof Error) {
                toast.error(error.message);
            }
        } finally {
            setIsLoading(false)
            formReset()
        }
    }

    const formFilled = React.useMemo(() => {
        if (!eventDate || !eventTime.value || !eventVenue) {
            return false;
        }

        if (currentEventType === "sports") {
            return Boolean(homeTeam && awayTeam);
        } else {
            return Boolean(eventTitle.value && regularPrice && vipPrice && files.length > 0);
        }
    }, [currentEventType, eventDate, eventTime.value, eventVenue, regularPrice, vipPrice, files, homeTeam, awayTeam, eventTitle.value]);

    return (
        <Card className="w-full border-zinc-800 sm:max-w-xl">
            <div className="p-6 h-24">
                <h1 className="text-4xl text-left text-white">CreateEvent</h1>
                <p className='text-amber-500 '>Events you create here can be shown on the homepage</p>
            </div>
            <div className="bg-zinc-800 mb-4 h-px" />
            <form onSubmit={onFormSubmit}>
                <CardContent className="flex flex-col gap-4">

                    <Select
                        value={currentEventType}
                        onValueChange={(value) => { formReset(value); setCurrentEventType(value); }}
                    >
                        <SelectTrigger className="w-full text-white border-zinc-800">
                            <SelectValue placeholder="Select Event Type" />
                        </SelectTrigger>
                        <SelectContent className={'text-white border-zinc-800'}>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                        </SelectContent>
                    </Select>

                    <section className="mt-4 flex flex-col gap-10">
                        {currentEventType === 'sports' ? (
                            <>
                                <div className="flex flex-col gap-2">
                                    <Label className="text-gray-400">Home Team</Label>
                                    {/* <Input type="text" value={homeTeam.value} onChange={homeTeam.onChange} /> */}
                                    <Select onValueChange={(value) => setHomeTeam(value)} value={homeTeam}>
                                        <SelectTrigger className="w-full text-white border-zinc-800">
                                            <SelectValue placeholder='Home' />
                                        </SelectTrigger>
                                        <SelectContent className="border-red-800">
                                            {CLUBS.map((club, idx) => (
                                                <SelectItem key={club.name + idx} value={club.name} className="border-red-500">
                                                    <Image src={club.icon} alt="club icon" width={32} height={100} />
                                                    <span>{club.name}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label className="text-gray-400">Away Team</Label>
                                    {/* <Input type="text" value={homeTeam.value} onChange={homeTeam.onChange} /> */}
                                    <Select onValueChange={value => setAwayTeam(value)} value={awayTeam}>
                                        <SelectTrigger className="w-full text-white border-zinc-800">
                                            <SelectValue placeholder='Away' />
                                        </SelectTrigger>
                                        <SelectContent className="w-full">
                                            {CLUBS.map((club, idx) => (
                                                <SelectItem key={club.name + idx} className="justify-between flex" value={club.name}>
                                                    <div className="flex gap-4 items-center w-full">
                                                        <Image src={club.icon} alt="club icon" width={32} height={100} />
                                                        <span className="">{club.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label className="text-gray-400">Stadium</Label>
                                    <Select onValueChange={value => setEventVenue(value)} value={eventVenue}>
                                        <SelectTrigger className="w-full text-white border-zinc-800">
                                            <SelectValue placeholder='Pick the stadium' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STADIUMS.map((stadium, idx) => (
                                                <SelectItem key={stadium.name + idx} className="flex gap-10" value={stadium.name}>
                                                    <span>{stadium.name}</span>
                                                    <span className="bg-slate-200 py-1 px-3 rounded text-xs text-slate-900">{stadium.state}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2 border-zinc-800">
                                    <Label className="text-gray-400">Title</Label>
                                    <Input type="text" className={'text-white'} value={eventTitle.value} onChange={eventTitle.onChange} />
                                </div>

                                <div className="flex flex-col gap-2 border-zinc-800">
                                    <Label className="text-gray-400">Venue</Label>
                                    <Input type="text" className={'text-white'} value={eventVenue} onChange={(e) => setEventVenue(e.target.value)} />
                                </div>

                                <div className="flex gap-4 w-full">
                                    <div className="flex flex-col gap-2 border-zinc-800 w-full">
                                        <Label className="text-gray-400">Regular Price</Label>
                                        <Input type="text" className={'text-white'} value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} />
                                    </div>
                                    <div className="flex flex-col gap-2 border-zinc-800 w-full">
                                        <Label className="text-gray-400">VIP Price</Label>
                                        <Input type="text" className={'text-white'} value={vipPrice} onChange={(e) => setVipPrice(e.target.value)} />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 border-zinc-800">
                                    <Label className="text-gray-400">Event Banner</Label>
                                    <div className="w-full max-w-4xl mx-auto min-h-30 border border-dashed bg-black border-zinc-800 rounded-lg">
                                        <FileUpload key={resetKey} onChange={setFiles} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* <div className="flex flex-col gap-2">
                            <Label className="text-gray-400">Venue</Label>
                            <Input type="text" value={eventVenue.value} onChange={eventVenue.onChange} />
                        </div> */}

                        {/* <div className="flex flex-col gap-2">
                            <Label className="text-gray-400">Venue</Label>
                            {/* <Input type="text" value={homeTeam.value} onChange={homeTeam.onChange} /> */}
                        {/* <Select onValueChange={value => setEventVenue(value)} value={eventVenue}>
                                <SelectTrigger className="w-full text-white border-zinc-800">
                                    <SelectValue placeholder='Pick the stadium' />
                                </SelectTrigger>
                                <SelectContent>
                                    {STADIUMS.map(stadium => (
                                        <SelectItem className="flex gap-10" value={stadium.name}>
                                            <span>{stadium.name}</span>
                                            <span className="bg-slate-200 py-1 px-3 rounded text-xs text-slate-900">{stadium.state}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select> 
                        </div> */}

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

                        <div className="flex flex-col gap-2 border-zinc-800">
                            <Label className="text-gray-400">Time</Label>
                            <Input className={'text-white'} onChange={eventTime.onChange} value={eventTime.value} type="time" step={1} />
                        </div>
                    </section>

                </CardContent>

                <CardFooter className="mt-10 border-t-2 border-zinc-800 pt-8 flex items-end jusify-end">
                    <Field orientation="horizontal" className="flex justify-end">
                        <Button type="button" variant="outline" onClick={() => router.push('/u/dashboard')}>
                            Cancel
                        </Button>
                        <Button className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-600" disabled={isLoading || !formFilled} type="submit">
                            {isLoading && <Spinner />}
                            Submit
                        </Button>
                    </Field>
                </CardFooter>
            </form>
        </Card>
    )
}

export default CreateEventForm