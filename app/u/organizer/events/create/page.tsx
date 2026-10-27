import CreateEventForm from '@/components/forms/CreateEventForm'
import React from 'react'
import { Sparkles } from 'lucide-react'

const OrganizerCreateEvent = () => {
  return (
    <div className='min-h-screen bg-background text-foreground transition-colors'>
      <div className="max-w-2xl mx-auto px-4 py-10 lg:py-16">

        {/* ── Page Header ── */}
        <div className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={10} />
            Event Creator
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">
            Create Your Next <span className="text-orange-500">Event</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Set up and publish your event to thousands of fans across Nigeria in minutes.
          </p>
        </div>

        {/* ── Form ── */}
        <CreateEventForm />

      </div>
    </div>
  )
}

export default OrganizerCreateEvent
