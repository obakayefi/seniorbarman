"use client"
import React from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import EditEventForm from '@/components/forms/EditEventForm'

const EditEventPage = () => {
    const params = useParams()
    const id = params.id as string

    return (
        <div className="md:p-10 p-6 w-full space-y-10 min-h-screen bg-zinc-950">
            <div className="max-w-4xl mx-auto space-y-8">
                <PageHeader
                    title="Edit Event"
                    description="Update event information, pricing and media"
                >
                    {/* <a href={`/u/a/events/${id}/print-tickets`} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        Print Tickets
                    </a> */}
                </PageHeader>

                <EditEventForm eventId={id} />
            </div>
        </div>
    )
}

export default EditEventPage
