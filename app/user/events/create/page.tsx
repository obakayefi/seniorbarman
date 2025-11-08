import CreateEventForm from '@/components/forms/CreateEventForm'
import React from 'react'

const CreateEvent = () => {
  return (
    <div className='h-screen flex-col flex items-center justify-center bg-slate-100 p-20'>
        <div>
            <h1 className="text-4xl text-center text-orange-600">CreateEvent</h1>
            <p className='text-gray-400'>Events you create here can be shown on the homepage</p>
        </div>

        <section className="mt-4 w-1/3">
            <CreateEventForm />
        </section>
    </div>
  )
}

export default CreateEvent

// home & away team
// date 
// time
// redirect to -> offer dropdown of current existing options

// admin can see a list of events and tag the ones that would be featured
// admin can also modify or delete events

// when someone books a ticket an email gets sent to admin for notification