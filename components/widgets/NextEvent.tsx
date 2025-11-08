"use client"
import Image from 'next/image'
import { redirect } from 'next/navigation'
import React from 'react'

const NextEvent = () => {
    return (
        <div className='absolute w-3/4 text-white rounded next-event-bg bottom-0 bg-[#434343]/89 left-[10%]'>
            <section className='flex justify-between mt-4'>
                <div className='bg-[#FDB902] w-48 p-2'>
                    <h3>UPCOMING EVENT</h3>
                </div>
                {/* Couontdown Timer */}
                <div className='bg-[#FDB902] w-48 p-2'>
                    <Image alt='icon' height={100} width={25} src='/clock-icon.svg'/>
                </div>
            </section>
            <section className='flex flex-col gap-3 py-4 items-center'>
                <div className='text-center'>
                    <h3 className='text-2xl'>RANGERS</h3>
                    <span className='text-[#C0C0C0]'>VS</span>
                    <h3 className='text-2xl'>SHOOTING STARS</h3>
                </div>
                <button onClick={() => redirect("/user/events")} className='bg-white cursor-pointer hover:opacity-95 duration-100 active:translate-y-1 text-[#E67A00] text-lg px-4 w-42 p-2 rounded'>Book Match</button>
            </section>
            <section className='flex justify-between px-4 p-2'>
                <h5>16 Nov 2025</h5>
                <div>pagination</div>
                <h5>4:00pm</h5>
            </section>
        </div>
    )
}

export default NextEvent