import CreateEventForm from '@/components/forms/CreateEventForm'
import React from 'react'

const CreateTicket = () => {
  return (
    <div className='h-screen flex-col flex items-center justify-center bg-slate-100 p-20'>
        <div>
            <h1 className="text-4xl text-center text-orange-600">Create Ticket </h1>
            <p className='text-gray-400'>Events you create here can be shown on the homepage</p>
        </div>

        <section className="mt-4 w-1/3">
            <CreateEventForm />
        </section>
    </div>
  )
}

export default CreateTicket