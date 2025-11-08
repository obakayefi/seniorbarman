"use client"
import { AlarmClock, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Button } from './button';
import { IEvent } from '@/types/components';
import { Dialog, DialogTrigger } from './dialog';
import { BookEventModal } from '../modals/book-event';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CLUBS } from '@/lib/utils';


export const EventCard = ({ event }: { event: IEvent }) => {
    const [matchInformation, setMatchInformation] = useState("")
    // export const EventCard = ({ event: { date, time, type, awayLogo, awayTeam, homeLogo, homeTeam, venue, id } }: { event: IEvent }) => {

    function formatDate(date: Date) {
        const _date = new Date(date);
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

        return {
            month: months[_date.getMonth()],
            day: String(_date.getDate()).padStart(2, "0"),
            year: String(_date.getFullYear())
        };
    }

    function formatEvent(event: IEvent) {
        const { day, month, year } = formatDate(event.date)
        const homeLogo = CLUBS.filter(club => (club.name === event.homeTeam))[0].icon
        const awayLogo = CLUBS.filter(club => (club.name === event.awayTeam))[0].icon

        return {
            day,
            month,
            year,
            awayLogo,
            homeLogo,
            awayTeam: event.awayTeam,
            homeTeam: event.homeTeam,
            venue: event.venue,
            time: event.time
        }
    }

    useEffect(() => {
        const _event = formatEvent(event)
        setMatchInformation(_event)
    }, [event])

    return (
        <section className='flex duration-200 hover:bg-gray-100/50 border flex border-gray-200 gap-3 justify-between items-center rounded-lg p-4'>
            <div className='flex flex-col items-center justify-center gap-1'>
                <span className='text-2xl'>{matchInformation.day}</span>
                <span className='text-4xl uppercase'>{matchInformation.month}</span>
                <span className='text-gray-400'>{matchInformation.year}</span>
            </div>

            <div className='flex items-center gap-2'>
                <Image
                    src={matchInformation.homeLogo}
                    alt='home logo'
                    height={100}
                    width={100}
                />
                <p>VS</p>
                <Image
                    src={matchInformation.awayLogo}
                    alt='away logo'
                    height={100}
                    objectFit='cover'
                    width={100}
                />
            </div>

            <div className='flex flex-col min-w-2/6 items-center max-w-2/6 grow-0'>
                <section className="flex gap-2 items-center">
                    <span className='text-center'>{matchInformation.homeTeam}</span>
                    <span>vs</span>
                    <span className='text-center'>{matchInformation.awayTeam}</span>
                </section>

                <span className='text-gray-400 flex items-center gap-1'>
                    <span> <MapPin size={14} color='#FF6600' /></span>
                    <span>{matchInformation.venue}</span>
                </span>

                <Dialog>
                    <div className='flex flex-col w-full mt-4'>
                        {/* <h3 className='text-center text-2xl text-slate-500'>₦6,000</h3> */}
                        <DialogTrigger asChild>
                            <Button
                                // onClick={() => redirect(`/user/events/${id}/`)}
                                className='bg-red-500 hover:bg-orange-400 active:translate-y-1 duration-200 text-lg rounded'>
                                Book Ticket
                            </Button>
                        </DialogTrigger>
                        <span className='text-gray-400 flex text-center mx-auto items-center gap-1'>
                            <p className='flex items-center gap-1'>
                                <span><AlarmClock color='#FF6600' size={14} /></span>
                                <span>Starts at</span>
                            </p>
                            <span className='text-red-400 font-bold'>{matchInformation.time}</span>
                        </span>
                    </div>
                    <BookEventModal eventId={event._id}/>
                </Dialog>
            </div>

        </section>
    )
}

export default EventCard