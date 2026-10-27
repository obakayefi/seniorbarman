import CreateEventForm from '@/components/forms/CreateEventForm'
import React from 'react'

const CreateEvent = () => {
  return (
    <div className='min-h-screen flex-col flex p-6 lg:p-12'>
      <CreateEventForm />
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