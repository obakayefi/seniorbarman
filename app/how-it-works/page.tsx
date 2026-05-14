import React from 'react'
import HowItWorks from '@/components/ui/how-it-works'
import { BackgroundBeams } from '@/components/ui/background-beams'

export const metadata = {
  title: 'How It Works | Senior Barman',
  description: 'Learn how to use Senior Barman to attend events, organize your own, or manage your sports team operations.',
}

export const dynamic = 'force-dynamic'

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <main className="flex-1 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0">
          <BackgroundBeams />
        </div>

        {/* Hero Section for the page */}
        {/* <section className="relative z-10 pt-20 pb-10 px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic">
              PLATFORM <span className="text-orange-500 underline decoration-orange-500/30 underline-offset-8">BLUEPRINT</span>
            </h1>
            <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Discover the full potential of the Senior Barman suite. From fan experiences to stadium-scale management.
            </p>
          </div>
        </section> */}

        {/* The Main Content Component */}
        <div className="relative z-10">
          <HowItWorks />
        </div>

        {/* Call to Action */}
        <section className="relative z-10 py-24 px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-zinc-900 to-black border border-white/5 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">Ready to get started?</h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto leading-relaxed">
              Join thousands of fans and organizers who trust Senior Barman for their event experiences and operations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/auth/register" className="h-16 px-10 bg-orange-500 hover:bg-white text-white hover:text-black font-black text-lg rounded-2xl transition-all duration-500 flex items-center justify-center group shadow-[0_20px_40px_rgba(249,115,22,0.2)]">
                CREATE ACCOUNT
              </a>
              <a href="/events" className="h-16 px-10 bg-zinc-800 hover:bg-zinc-700 text-white font-black text-lg rounded-2xl transition-all duration-500 flex items-center justify-center">
                BROWSE EVENTS
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default HowItWorksPage
