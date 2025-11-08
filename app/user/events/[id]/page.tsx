"use client"
import React from 'react'
import { useParams } from 'next/navigation'
import BuyTicket from '@/components/modals/buy-ticket'


const EventDetail = () => {
    const params = useParams()
    console.log({ params })
    return (
        <div>
            <BuyTicket />
        </div>
    )
}

export default EventDetail