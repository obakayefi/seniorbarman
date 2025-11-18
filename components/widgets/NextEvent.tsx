"use client"
import api from '@/lib/axios'
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Keyboard, Pagination, Navigation } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import React, { useEffect } from 'react'
import { useCountdown } from '@/hooks/useCountdown';

const EventSlide = ({ event }: { event: any }) => {
    // const targetDate = React.useMemo(() => {
    //     const now = new Date();
    //     return new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    // }, []);
    const { days, hours, minutes, seconds } = useCountdown(event.date)

    function toAmPm(time24: any) {
        const [h, m] = time24.split(":").map(Number);

        if (h === 0) return `12:${m.toString().padStart(2, "0")} am`;
        if (h === 12) return `12:${m.toString().padStart(2, "0")} pm`;
        if (h < 12)  return `${h}:${m.toString().padStart(2, "0")} am`;

        return `${h - 12}:${m.toString().padStart(2, "0")} pm`;
    }

    return (
        <div className=' text-white rounded bg-[#434343]/89'>
            <section className='flex bg-[#FDB902] justify-center md:justify-between mt-4'>
                <div className='hidden md:flex items-center justify-center text-slate-700  pl-3 '>
                    <h3>UPCOMING EVENT</h3>
                </div>
                {/* Couontdown Timer */}
                <div className='flex items-start justify-center gap-2 text-slate-700 w-62 p-2'>
                    <Image className='hidden md:flex' alt='icon' height={100} width={40} src='/clock-icon.svg' />
                    <div className='flex items-start justify-center gap-1'>
                        <section className='flex items-center justify-center flex-col text-center'>
                            <div className='flex items-start gap-3'>
                                <span className='text-xl font-semibold ml-3'>{days}</span>
                                <span className='text-xl pb-1.5 font-semibold'>:</span>
                            </div>
                            <span className='text-xs'>DAYS</span>
                        </section>


                        <section className='flex items-center justify-center flex-col text-center'>
                            <div className='flex items-start gap-3'>
                                <span className='text-xl font-semibold ml-3'>{hours}</span>
                                <span className='text-xl pb-1.5 font-semibold'>:</span>
                            </div>
                            <span className='text-xs'>HOURS</span>
                        </section>

                        <section className='flex items-center justify-center flex-col text-center'>
                            <div className='flex items-start gap-3'>
                                <span className='text-xl font-semibold ml-3'>{minutes}</span>
                                <span className='text-xl pb-1.5 font-semibold'>:</span>
                            </div>
                            <span className='text-xs'>MINS</span>
                        </section>

                        <section className='flex items-center justify-center flex-col text-center'>
                            <div className='flex items-start gap-3 w-12'>
                                <span className='text-xl font-semibold ml-3'>{seconds}</span>
                                <span className='text-xl pb-1.5 font-semibold invisible'>:</span>
                            </div>
                            <span className='text-xs'>SECS</span>
                        </section>
                    </div>
                </div>
            </section>
            <section className='flex flex-col gap-3 py-4 items-center'>
                <div className='text-center'>
                    <h3 className='text-2xl'>{event.homeTeam}</h3>
                    <span className='text-[#C0C0C0]'>VS</span>
                    <h3 className='text-2xl'>{event.awayTeam}</h3>
                </div>
                <button
                    onClick={() => redirect("/u/events")}
                    disabled={true}
                    className='bg-white disabled:cursor-not-allowed cursor-pointer disabled:bg-slate-400 disabled:text-gray-100 hover:opacity-95 duration-100 active:translate-y-1 text-[#E67A00] text-lg px-4 w-42 p-2 rounded'>
                    Book Match
                </button>
            </section>
            <section className='flex justify-between px-4 p-2'>
                <h5>{new Date(event.date).toDateString()}</h5>
                <h5>{toAmPm(event.time)}</h5>
            </section>
        </div>
    )
}

const NextEvent = () => {
    // const events = await api.get('/events')
    const [events, setEvents] = React.useState<any>(null)
    const [mounted, setMounted] = React.useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchNextEvents = async () => {
            try {
                const response = await api.get('/events?upcoming=true/')
                console.log('Next Event Data:', response.data)
                setEvents(response.data)
            } catch (error) {
                console.error('Error fetching next event:', error)
            }
        }
        fetchNextEvents()
    }, [])

    if (!mounted) {
        return null;
    }

    return (
        <Swiper
            slidesPerView={1}
            spaceBetween={5}
            keyboard={{
                enabled: true,
            }}
            pagination={{
                clickable: true,
            }}
            // navigation={true}
            modules={[Keyboard, Pagination, Navigation]}
            className="mySwiper"
        >
            {(events && events?.length > 0) && events.map((event: any) => (
                <SwiperSlide key={event.id}>
                    <EventSlide event={event} />
                </SwiperSlide>
            ))}
        </Swiper>
    )
}

export default NextEvent