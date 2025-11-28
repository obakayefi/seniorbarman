import React from 'react'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { CalendarDays, ScanQrCode, Tickets, UserPlus } from 'lucide-react'
import { getUserFromCookie } from '@/lib/auth'
import { sitemap } from '@/lib/utils'


const UserLayout = async ({ children }: { children: React.ReactNode }) => {
    // if (!user.authenticated) redirect('/auth/login')

    const user = await getUserFromCookie()
    
    // if no token - logout to terminate session
    if (!user) redirect('/auth/logout')
    
    const userLinks = [
        {
            title: "Dashboard",
            url: sitemap.user.dashboard,
            icon: CalendarDays,
        },
        {
            title: "Tickets",
            url: sitemap.user.tickets,
            icon: Tickets,
        },
    ]

    const bouncerLinks = [
        {
            title: "Scanner",
            url: sitemap.bouncer.scanner,
            roles: ["bouncer", "admin"],
            icon: ScanQrCode,
        },
        ...userLinks,
    ]

    const adminLinks = [
        {
            title: "Create Admin",
            url: sitemap.admin.createAdmin,
            roles: ["admin"],
            icon: UserPlus,
        },
        {
            title: "Create Events",
            url: sitemap.admin.createEvent,
            roles: ["admin"],
            icon: UserPlus,
        },
        {
            title: "Users",
            url: sitemap.admin.users,
            roles: ["bouncer", "admin"],
            icon: UserPlus,
        },
        ...bouncerLinks,
    ]

    const navlinks = user?.role === "admin" ? adminLinks : user?.role === "bouncer" ? bouncerLinks : userLinks

    return (
        <SidebarProvider>
            <AppSidebar links={navlinks} />
            <main className='w-full'>
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}

export default UserLayout

