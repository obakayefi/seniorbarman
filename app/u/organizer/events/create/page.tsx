import CreateEventForm from '@/components/forms/CreateEventForm'
import React from 'react'

const OrganizerCreateEvent = () => {
  return (
    <div className='min-h-screen flex-col flex items-center justify-center p-4 lg:p-20'>
      <section className="mt-8 w-full items-center flex justify-center sm:w-2/3 ">
        <CreateEventForm />
      </section>
    </div>
  )
}

export default OrganizerCreateEvent
