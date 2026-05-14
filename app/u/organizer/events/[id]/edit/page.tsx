"use client"
import React, { use } from 'react'
import EditEventForm from '@/components/forms/EditEventForm'

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    
    return (
        <div className="flex-1 w-full min-h-screen bg-zinc-950 p-6 md:p-10">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <EditEventForm eventId={id} />
            </div>
        </div>
    )
}
