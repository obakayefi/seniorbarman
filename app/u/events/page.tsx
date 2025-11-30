"use client"
import {Button} from '@/components/ui/button'
import {PageHeader} from '@/components/ui/page-header'
import {SummaryCard} from '@/components/ui/summary-card'
import {getCoreRowModel, useReactTable} from '@tanstack/react-table'
import {Calendar1, CalendarClock, CalendarDays, CalendarPlus, CalendarX, Search} from 'lucide-react'
import {sportsColumns} from './columns'
import React, {useEffect} from 'react'
import {DataTable} from './data-table'
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from '@/components/ui/input-group'
import {Spinner} from '@/components/ui/spinner'
import EventCard from '@/components/ui/event-card'
import {EventType, IEvent} from '@/types/components'
import api from '@/lib/axios'
import {EmblaCarousel} from '@/components/carousels/EmblaCarousel'
import {useApp} from "@/context/AppContext";
import {redirect} from "next/navigation";
import {sitemap} from "@/lib/utils";

const MOCK_EVENT_STATS = [
    {
        title: 'Total Events',
        value: 152,
        icon: <CalendarDays/>
    },
    {
        title: 'Ongoing Events',
        value: 1,
        icon: <Calendar1/>
    },
    {
        title: 'Upcoming Events',
        value: 23,
        icon: <CalendarClock/>
    },
]

async function getData(): Promise<{}[]> {
    // Fetch data from your API here.
    return [
        {
            id: "728ed42f",
            venue: "Abuja National Stadium, Gwarimkpa",
            teamA: "C.O.D UNITED FOOTBALL CLUB OF LAGOS",
            teamB: "ENYIMBA FC",
            status: "upcoming",
            type: "soccer",
            date: "20th Sept, 2025",
            time: "15:00",
            action: "delete",
        },
        {
            id: "728e662f",
            venue: "Abuja National Stadium, Gwarimkpa",
            teamA: "KANO PILLARS",
            teamB: "ADAMAWA ZYGOTES",
            status: "upcoming",
            type: "soccer",
            date: "20th Sept, 2025",
            time: "15:00",
            action: "delete",
        },
        {
            id: "72853652f",
            venue: "Abuja National Stadium, Gwarimkpa",
            teamA: "C.O.D UNITED FOOTBALL CLUB OF LAGOS",
            teamB: "ENYIMBA FC",
            status: "ongoing",
            type: "soccer",
            date: "20th Sept, 2025",
            time: "15:00",
            action: "delete",
        },
        {
            id: "2328ed52f",
            venue: "Abuja National Stadium, Gwarimkpa",
            teamA: "KANO PILLARS",
            teamB: "ADAMAWA ZYGOTES",
            status: "ongoing",
            type: "soccer",
            date: "20th Sept, 2025",
            time: "15:00",
            action: "delete",
        },
        {
            id: "208ed52f",
            venue: "Abuja National Stadium, Gwarimkpa",
            teamA: "KANO PILLARS",
            teamB: "ADAMAWA ZYGOTES",
            status: "upcoming",
            type: "soccer",
            date: "20th Sept, 2025",
            time: "15:00",
            action: "delete",
        },
        {
            id: "80ed52f",
            venue: "Abuja National Stadium, Gwarimkpa",
            teamA: "C.O.D UNITED FOOTBALL CLUB OF LAGOS",
            teamB: "ENYIMBA FC",
            status: "ongoing",
            type: "soccer",
            date: "20th Sept, 2025",
            time: "15:00",
            action: "delete",
        },
        {
            id: "1228ed52f",
            venue: "Abuja National Stadium, Gwarimkpa",
            teamA: "KANO PILLARS",
            teamB: "ADAMAWA ZYGOTES",
            status: "ongoing",
            type: "regular",
            date: "20th Sept, 2025",
            time: "15:00",
            action: "delete",
        },
        {
            id: "828ed52f",
            venue: "Abuja National Stadium, Gwarimkpa",
            teamA: "KANO PILLARS",
            teamB: "ADAMAWA ZYGOTES",
            status: "upcoming",
            type: "soccer",
            date: "20th Sept, 2025",
            time: "15:00",
            action: "delete",
        },

    ]
}

async function getEvents() {
    try {
        const {data} = await api.get("/events")
        console.log({data})
        const upcomingGames = {...data}
        return data
    } catch (error: any) {
        console.error('Could not get events', {error: error.message})
    }
}

const Events = () => {
    const [data, setData] = React.useState<EventType[]>([])
    const [eventStats, setEventStats] = React.useState({})
    const [isLoading, setIsLoading] = React.useState(true)
    const {user} = useApp()

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true)
            const _events = await getEvents()
            console.log("Fetching events", {events: _events})
            const stats = {
                upcoming: _events.upcomingEvents,
                total: _events.totalEvents,
            }
            setData(_events.events)
            setEventStats(stats)
            setIsLoading(false)
        }
        fetchEvents()
    }, [])

    return (
        <div className='md:p-10 p-2 w-full'>
            <PageHeader title='Upcoming Events'>
                <div className='flex items-center gap-1'>
                    {user?.role === "admin" ? (
                        <Button onClick={() => redirect(sitemap.admin.createEvent)} title='Create Event'
                                className='px-6 bg-orange-500 py-5 active:translate-x-2 duration-200'>
                            Create Event <CalendarPlus/>
                        </Button>
                    ) : null}
                </div>
            </PageHeader>

            {/* <section>
                <EmblaCarousel />
            </section> */}
            {/*{MOCK_EVENT_STATS.map(event => (*/}
            {/*    <SummaryCard icon={event.icon} key={event.title} title={event.title} value={event.value} />*/}
            {/*))}*/}

            {/*{eventStats.total ? (*/}
            {/*    <section className="flex items-center flex-col lg:flex-row overflow-x-auto mt-10 gap-2">*/}
            {/*        <SummaryCard icon={<CalendarDays/>} title={"Total Events"} value={eventStats?.total}/>*/}
            {/*        <SummaryCard icon={<Calendar1/>} title={"Upcoming Events"} value={eventStats?.upcoming}/>*/}
            {/*        <SummaryCard icon={<CalendarClock/>} title={"Ongoing Events"} value={eventStats?.total}/>*/}
            {/*    </section>*/}
            {/*) : null}*/}

            <section className='mt-10'>
                {/*<h1 className='text-3xl mb-4'>Upcoming Events</h1>*/}
                <div className=' flex sm:grid items-center md:grid-cols-2 flex-col gap-4'>
                    {isLoading ? (
                        <div className='flex items-center w-full gap-2 text-slate-700 text-left'>
                            <h2>Loading Upcoming Fixtures </h2>
                            <Spinner/>
                        </div>
                    ) : data.length === 0 ? (
                        <div>
                            <h2>No Events</h2>
                            <p>There are no upcoming matches for the season</p>
                        </div>
                    ) : (
                        (
                            data.map(event => <EventCard key={event._id} event={event}/>
                            ))
                    )}
                </div>
            </section>
        </div>
    )
}

export default Events