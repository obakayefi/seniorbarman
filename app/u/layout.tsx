import React from 'react'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { CalendarDays, CalendarPlus, History as HistoryIcon, LayoutDashboard, PartyPopper, ScanQrCode, ShieldUser, Sparkles, Tickets, UserPlus, UsersRound } from 'lucide-react'
import { getUserFromCookie } from '@/lib/auth'
import { sitemap } from '@/lib/utils'
import { GiSoccerField } from "react-icons/gi";
import { TbSoccerField } from 'react-icons/tb'
import { BiParty } from 'react-icons/bi'



const UserLayout = async ({ children }: { children: React.ReactNode }) => {
    // if (!user.authenticated) redirect('/auth/login')

    const user = await getUserFromCookie()

    // if no token - logout to terminate session
    if (!user) redirect('/auth/logout')

    const userLinks = [
        {
            title: "Dashboard",
            url: sitemap.user.dashboard,
            icon: LayoutDashboard,
        },
        {
            title: "Browse Upcoming Events",
            url: sitemap.user.eventsTicketPurchase,
            icon: BiParty,
        },
        {
            title: "Buy Ranger's Ticket",
            url: sitemap.user.rangersTicketPurchase,
            icon: TbSoccerField,
        },
        {
            title: "Tickets",
            url: sitemap.user.tickets,
            icon: Tickets,
        },
    ]

    const bouncerLinks = [
        ...userLinks,
        {
            title: "Scanner",
            url: sitemap.bouncer.scanner,
            roles: ["bouncer", "admin"],
            icon: ScanQrCode,
        },
    ]

    const adminLinks = [
        {
            title: "Dashboard",
            url: sitemap.admin.dashboard,
            icon: LayoutDashboard,
        },
        ...bouncerLinks.filter(link => link.title !== "Dashboard"), // Avoid duplicate dashboard if bouncerLinks starts with userLinks
        {
            title: "Ticket Grant Wizard",
            url: sitemap.admin.ticketGrantWizard,
            roles: ["admin"],
            icon: Sparkles,
        },
        {
            title: "Create Admin",
            url: sitemap.admin.createAdmin,
            roles: ["admin"],
            icon: ShieldUser,
        },
        {
            title: "Create Events",
            url: sitemap.admin.createEvent,
            roles: ["admin"],
            icon: CalendarPlus,
        },
        {
            title: "User Management",
            url: sitemap.admin.users,
            roles: ["admin"],
            icon: UsersRound,
        },
        {
            title: "Audit Logs",
            url: sitemap.admin.auditLogs,
            roles: ["admin"],
            icon: HistoryIcon,
        },
    ]

    const navlinks = user?.role === "admin" ? adminLinks : user?.role === "bouncer" ? bouncerLinks : userLinks

    return (
        <SidebarProvider>
            <AppSidebar links={navlinks} />
            <main className='w-full bg-[#020202]'>
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}

export default UserLayout

