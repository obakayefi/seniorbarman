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
    <div className="min-h-screen bg-background text-foreground transition-colors flex flex-col">
      <main className="flex-1 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-100">
          <BackgroundBeams />
        </div>

        {/* The Main Content Component */}
        <div className="relative z-10">
          <HowItWorks />
        </div>

        {/* Call to Action */}
        <section className="relative z-10 py-20 px-6">
          <div className="relative max-w-5xl mx-auto overflow-hidden rounded-[2.5rem] border border-orange-500/20 bg-gradient-to-b from-orange-500/5 via-card to-card p-10 md:p-16 text-center space-y-8 shadow-2xl transition-all">
            {/* Ambient Background Glow Effects */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/15 dark:bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-6xl font-black text-foreground tracking-tight uppercase italic leading-tight">
                Ready to get <span className="text-orange-500 underline decoration-orange-500/30 underline-offset-8">started?</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed">
                Join thousands of fans, organizers, and team staff who trust Senior Barman for seamless ticket bookings and match operations.
              </p>
            </div>

            {/* Interactive Action Buttons */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href="/auth/register"
                className="w-full sm:w-auto h-14 px-8 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 group"
              >
                <span>CREATE ACCOUNT</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a
                href="/events"
                className="w-full sm:w-auto h-14 px-8 bg-card hover:bg-muted text-foreground font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-border shadow-sm hover:border-orange-500/40"
              >
                <span>BROWSE EVENTS</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default HowItWorksPage
