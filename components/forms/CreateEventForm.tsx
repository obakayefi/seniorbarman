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
import { redirect } from "next/navigation";
import { FileUpload } from "../ui/file-upload";

function formatDate(date: Date | undefined) {
    if (!date) {
        return ""
    }

    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false
    }
    return !isNaN(date.getTime())
}

const CreateEventForm = () => {
    const [currentEventType, setCurrentEventType] = React.useState('sports')
    // const [eventDate, setEventDate] = React.useState<Date | undefined>(new Date(Date.now()))
    const [eventDate, setEventDate] = React.useState<Date | undefined>(new Date(Date.now()))
    const [month, setMonth] = React.useState<Date | undefined>(eventDate)
    const [dateValue, setDateValue] = React.useState<Date | undefined>(new Date(formatDate(eventDate)))
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
        const eventDetails = {
            eventType: currentEventType ?? "N/A",
            homeTeam,
            awayTeam,
            eventVenue,
            eventTitle: eventTitle.value ?? "N/A",
            eventDate: eventDate,
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
            if (!res.ok) throw new Error(data.error || "Failed to create event");
            console.log("Event created: ", data)
            toast.success('🥳 Event created successfully')
        } catch (error) {
            console.error('Error submitting  form:', error)
        } finally {
            setIsLoading(false)
            formReset()
        }
    }

    return (
        <Card className="w-full border-zinc-800 sm:max-w-xl">
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
                                            {CLUBS.map(club => (
                                                <SelectItem value={club.name} className="border-red-500">
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
                                            {CLUBS.map(club => (
                                                <SelectItem className="justify-between flex" value={club.name}>
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
                                            {STADIUMS.map(stadium => (
                                                <SelectItem className="flex gap-10" value={stadium.name}>
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
                            <Input className={'text-white'} onChange={eventTime.onChange} value={eventTime.value} type="time" step={1} defaultValue={"12:00:00"} />
                        </div>
                    </section>

                </CardContent>

                <CardFooter className="mt-10 border-t-2 border-zinc-800 pt-8 flex items-end jusify-end">
                    <Field orientation="horizontal" className="flex justify-end">
                        <Button type="button" variant="outline" onClick={() => redirect('/u/dashboard')}>
                            Cancel
                        </Button>
                        <Button className="bg-orange-500 hover:bg-orange-600" disabled={isLoading} type="submit">
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