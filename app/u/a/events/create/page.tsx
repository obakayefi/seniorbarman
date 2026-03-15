import CreateEventForm from '@/components/forms/CreateEventForm'
import React from 'react'

const CreateEvent = () => {
  return (
    <div className='min-h-screen flex-col flex items-center justify-center  p-4 lg:p-20'>
      <section className="mt-8 w-full items-center flex justify-center sm:w-2/3 ">
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