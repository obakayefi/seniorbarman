"use client"
import {AlarmClock, MapPin} from 'lucide-react';
import Image from 'next/image';
import {Button} from './button';
import {EventType, IEvent} from '@/types/components';
import {Dialog, DialogTrigger} from './dialog';
import {BookEventModal} from '../modals/book-event';
import {redirect} from 'next/navigation';
import {useEffect, useState} from 'react';
import {CLUBS, formatEvent} from '@/lib/utils';

export const EventCard = ({event}: { event: EventType }) => {
    const [matchInformation, setMatchInformation] = useState<EventType>({} as EventType)
    // export const EventCard = ({ event: { date, time, type, awayLogo, awayTeam, homeLogo, homeTeam, venue, id } }: { event: IEvent }) => {

    useEffect(() => {
        const _event = formatEvent(event) as EventType
        setMatchInformation(_event)
    }, [event])

    return (
        <section
            className='flex flex-col outline w-full items-center   duration-200 hover:bg-gray-100/50 border border-gray-200 gap-3 justify-center rounded-lg p-4'>
            <div className='flex items-center justify-center gap-1'>
                <span className=''>{matchInformation.day}</span>
                <span className=' uppercase'>{matchInformation.month}</span>
                <span className='text-gray-400'>{matchInformation.year}</span>
            </div>
            <section className='flex w-full items-center justify-center'>

                <div className='flex items-center flex-col gap-2'>
                    <div className="flex items-center gap-2">
                        <section className='flex h-40 justify-between items-center gap-1'>
                            <span className='text-center'>{matchInformation.homeTeam}</span>
                            {console.log({matchInfo: matchInformation.homeLogo})}
                            <Image
                                src={matchInformation.homeLogo ?? "https://placehold.co/400"}
                                alt='home logo'
                                className='h-14 lg:h-24 lg:w-24 h w-14'
                                height={100}
                                width={100}
                            />
                        </section>
                        <p>VS</p>
                        <section className='flex h-40 justify-center items-center gap-1'>
                            <Image
                                src={matchInformation.awayLogo ?? "https://placehold.co/400"}
                                alt='away logo'
                                height={100}
                                objectFit='cover'
                                className='h-14 lg:h-24 lg:w-24 h w-14'
                                width={100}
                            />
                            <span className='text-center'>{matchInformation.awayTeam}</span>
                        </section>
                    </div>

                    <div className='flex flex-col items-center w-full'>
                        <Dialog>
                            <div className='flex flex-col w-full mt-1'>
                                <DialogTrigger asChild>
                                    <Button
                                        className='bg-red-500 hover:bg-orange-400 active:translate-y-1 duration-200 text-lg rounded'>
                                        Book Ticket
                                    </Button>
                                </DialogTrigger>

                            </div>
                            <BookEventModal eventId={event._id}/>
                        </Dialog>
                        <section className='mt-2 text-center'>
                            <span className='text-gray-400 flex items-center gap-1'>
                                <span className='text-red-400 font-bold'>{matchInformation.time}</span> @ <span
                                className='text-sm'>{matchInformation.venue}</span>
                            </span>

                        </section>
                    </div>
                </div>
            </section>

        </section>
    )
}

export default EventCard