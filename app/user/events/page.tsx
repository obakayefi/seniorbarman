"use client"
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { SummaryCard } from '@/components/ui/summary-card'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Calendar1, CalendarClock, CalendarDays, CalendarPlus, CalendarX, Search } from 'lucide-react'
import { sportsColumns } from './columns'
import React, { useEffect } from 'react'
import { DataTable } from './data-table'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import EventCard from '@/components/ui/event-card'
import { EventType, IEvent } from '@/types/components'
import axios from 'axios'
import api from '@/lib/axios'

const MOCK_EVENT_STATS = [
    {
        title: 'Ongoing Events',
        value: 60,
        icon: <Calendar1 />
    },
    {
        title: 'Total Events',
        value: 3402,
        icon: <CalendarDays />
    },
    {
        title: 'Upcoming Events',
        value: 1801,
        icon: <CalendarClock />
    },
    {
        title: 'Past Events',
        value: 2001,
        icon: <CalendarX />
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


// async function getEvents(): Promise<IEvent[]> {
//     return [
//         {
//             id: "3",
//             homeTeam: "Rangers FC",
//             type: "sports",
//             homeLogo: '/rangers-logo.png', // file name within public folder
//             awayLogo: '/enyimba-logo.png',
//             awayTeam: "Enyimba FC",
//             venue: "Nnamdi Azikiwe Stadium",
//             time: "16:00",
//             date: {
//                 day: "16",
//                 month: "Nov",
//                 year: "2025"
//             },
//         },
//         {
//             id: "113",
//             homeTeam: "Rangers FC",
//             type: "sports",
//             homeLogo: '/rangers-logo.png', // file name within public folder
//             awayLogo: '/ikorodu-city-logo.png',
//             awayTeam: "Ikorodu City",
//             venue: "Nnamdi Azikiwe Stadium",
//             time: "16:00",
//             date: {
//                 day: "21",
//                 month: "Dec",
//                 year: "2025"
//             },
//         },
//         {
//             id: "611",
//             homeTeam: "Rangers FC",
//             type: "sports",
//             homeLogo: '/rangers-logo.png', // file name within public folder
//             awayLogo: '/remo-stars-logo.png',
//             awayTeam: "Remo Stars",
//             venue: "Nnamdi Azikiwe Stadium",
//             time: "16:00",
//             date: {
//                 day: "25",
//                 month: "Dec",
//                 year: "2025"
//             },
//         },
//         {
//             id: "032",
//             homeTeam: "Rangers FC",
//             type: "sports",
//             homeLogo: '/rangers-logo.png', // file name within public folder
//             awayLogo: '/bayelsa-logo.png',
//             awayTeam: "Bayelsa United FC",
//             venue: "Nnamdi Azikiwe Stadium",
//             time: "16:00",
//             date: {
//                 day: "29",
//                 month: "JAN",
//                 year: "2026"
//             },
//         },
//     ]
// }

async function getEvents() {
    try {
        const { data } = await api.get("/events")
        console.log({ data })
        const upcomingGames = { ...data }
        // upcomingGames.map(game => {
        //     consoe
        // })
        return data
    } catch (error: any) {
        console.error('Could not get events', { error: error.message })
    }
}


const Events = () => {
    const [data, setData] = React.useState<EventType[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const role = { is_admin: false }


    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true)
            const _events = await getEvents()
            setData(_events)
            setIsLoading(false)
        }
        fetchEvents()
    }, [])

    // const table = useReactTable({
    //     data,
    //     columns: sportsColumns,
    //     // getCoreRowModel: getCoreRowModel(),
    //     // getPaginationRowModel: getPaginationRowModel(),
    //     getCoreRowModel: getCoreRowModel(),
    // })
    return (
        <div className='md:p-10 p-2 w-full'>
            <PageHeader title='Events'>
                <div className='flex items-center gap-1'>
                    {role.is_admin ? (
                        <Button title='Create Event' className='px-6 bg-orange-500 py-5 active:translate-x-2 duration-200'>
                            Create Event <CalendarPlus />
                        </Button>
                    ) : null}
                </div>
            </PageHeader>
            <section className="flex items-center flex-col md:flex-row items-center overflow-x-auto mt-10 gap-2">
                {MOCK_EVENT_STATS.map(event => (
                    <SummaryCard icon={event.icon} key={event.title} title={event.title} value={event.value} />
                ))}
            </section>

            <section className='mt-10'>
                <h1 className='text-4xl mb-4'>Upcoming Events</h1>
                <div className=' flex sm:grid items-center md:grid-cols-2 flex-col gap-4'>
                    {isLoading ? (
                        <div className='flex items-center w-full gap-2 text-slate-700 text-left'>
                            <h2>Loading Upcoming Fixtures </h2>
                            <Spinner />
                        </div>
                    ) : data.length === 0 ? (
                        <div>
                            <h2>No Events</h2>
                            <p>There are no upcoming matches for the season</p>
                        </div>
                    ) : (
                        (
                            data.map(event => <EventCard key={event._id} event={event} />
                            ))
                    )}

                </div>
            </section>
        </div>
    )
}

export default Events