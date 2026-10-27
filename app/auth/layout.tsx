import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ArrowLeft } from 'lucide-react'

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen relative flex flex-col justify-between bg-background text-foreground transition-colors overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-orange-500/15 dark:bg-orange-500/10 blur-[130px] rounded-full" />
                <div className="absolute -bottom-40 right-10 w-[400px] h-[400px] bg-amber-500/10 dark:bg-amber-600/5 blur-[120px] rounded-full" />
                <div className="absolute top-1/3 -left-32 w-[300px] h-[300px] bg-orange-600/10 dark:bg-orange-600/5 blur-[100px] rounded-full" />
            </div>

            {/* Auth Top Header */}
            <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                {/* <Link href="/" className="flex items-center gap-2 group transition-transform duration-200 hover:scale-105">
                    <Image
                        src="/logo-clear.svg"
                        alt="Senior Barman"
                        height={36}
                        width={160}
                        className="h-8 w-auto object-contain"
                        priority
                    />
                </Link> */}

                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/50"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to Home
                    </Link>
                    {/* <ThemeToggle /> */}
                </div>
            </header>

            {/* Main Auth Content Area */}
            <main className="relative z-10 w-full flex-1 flex items-center justify-center px-4 py-8 md:py-12">
                {children}
            </main>

            {/* Subtle Footer */}
            <footer className="relative z-10 w-full text-center py-4 text-xs text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Senior Barman. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default Layout