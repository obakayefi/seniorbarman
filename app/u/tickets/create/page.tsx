import CreateEventForm from '@/components/forms/CreateEventForm'
import React from 'react'

const CreateTicket = () => {
  return (
    <div className='h-screen flex-col flex items-center justify-center bg-slate-100 p-20'>
      <section className="mt-4 w-1/3">
        <CreateEventForm />
      </section>
    </div>
  )
}

export default CreateTicket