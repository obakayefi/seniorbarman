"use client"
import { useParams } from 'next/navigation'

const EventDetail = () => {
    const params = useParams()
    console.log({ params })
    return (
        <div>
            <h2 className="text-3xl text-orange-400">Event Details</h2>
        </div>
    )
}

export default EventDetail