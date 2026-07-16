import React from 'react'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { CalendarDays, CalendarPlus, History as HistoryIcon, LayoutDashboard, PartyPopper, ScanQrCode, ShieldUser, Sparkles, Tickets, UserPlus, UsersRound, Bug, Settings2, FolderKanban, ClipboardList } from 'lucide-react'
import { getUserFromCookie } from '@/lib/auth'
import { sitemap } from '@/lib/utils'
import { ROLES } from '@/lib/roles'
import { GiSoccerField } from "react-icons/gi";
import { TbSoccerField } from 'react-icons/tb'
import { BiParty } from 'react-icons/bi'

const UserLayout = async ({ children }: { children: React.ReactNode }) => {
    const user = await getUserFromCookie()

    if (!user) redirect('/auth/logout')

    const userLinks = [
        {
            title: "Dashboard",
            url: sitemap.user.dashboard,
            icon: "LayoutDashboard",
        },
        {
            title: "Upcoming Events",
            url: sitemap.user.eventsTicketPurchase,
            icon: "BiParty",
        },
        {
            title: "Rangers Matches",
            url: sitemap.user.rangersTicketPurchase,
            icon: "TbSoccerField",
        },
        {
            title: "Tickets",
            url: sitemap.user.tickets,
            icon: "Tickets",
        },
        {
            title: "My Applications",
            url: "/u/applications",
            icon: "ClipboardList",
        },
    ]

    const organizerLinks = [
        {
            title: "Dashboard",
            url: sitemap.organizer.dashboard,
            icon: "LayoutDashboard",
        },
        {
            title: "My Events",
            url: "/u/organizer/events/manage",
            icon: "FolderKanban",
        },
        {
            title: "Create Event",
            url: sitemap.organizer.createEvent,
            icon: "CalendarPlus",
        },
        {
            title: "Scanner",
            url: sitemap.bouncer.scanner,
            icon: "ScanQrCode",
        },
        {
            title: "Upcoming Events",
            url: sitemap.user.eventsTicketPurchase,
            icon: "BiParty",
        },
        {
            title: "Tickets",
            url: sitemap.user.tickets,
            icon: "Tickets",
        },
        {
            title: "My Applications",
            url: "/u/applications",
            icon: "ClipboardList",
        },
        {
            title: "Event Applicants",
            url: "/u/a/applications",
            icon: "ClipboardList",
        },
    ]

    const bouncerLinks = [
        ...userLinks,
        {
            title: "Scanner",
            url: sitemap.bouncer.scanner,
            roles: ["bouncer", "admin"],
            icon: "ScanQrCode",
        },
    ]

    const teamManagerLinks = [
        {
            title: "Dashboard",
            url: "/u/tm/dashboard",
            icon: "LayoutDashboard",
        },
        {
            title: "My Events",
            url: "/u/organizer/events/manage",
            icon: "FolderKanban",
        },
        {
            title: "Create Event",
            url: sitemap.organizer.createEvent,
            icon: "CalendarPlus",
        },
        {
            title: "Activity Log",
            url: "/u/tm/audit",
            icon: "History",
        },
        {
            title: "Scanner",
            url: sitemap.bouncer.scanner,
            icon: "ScanQrCode",
        },
        {
            title: "Upcoming Matches",
            url: sitemap.user.eventsTicketPurchase,
            icon: "BiParty",
        },
        {
            title: "Tickets",
            url: sitemap.user.tickets,
            icon: "Tickets",
        },
    ]

    const adminLinks = [
        {
            title: "Dashboard",
            url: sitemap.admin.dashboard,
            icon: "LayoutDashboard",
        },
        ...bouncerLinks.filter(link => link.title !== "Dashboard"),
        {
            title: "Ticket Grant Wizard",
            url: sitemap.admin.ticketGrantWizard,
            roles: ["admin"],
            icon: "Sparkles",
        },
        {
            title: "Create Admin",
            url: sitemap.admin.createAdmin,
            roles: ["admin"],
            icon: "ShieldUser",
        },
        {
            title: "Create Events",
            url: sitemap.admin.createEvent,
            roles: ["admin"],
            icon: "CalendarPlus",
        },
        {
            title: "User Management",
            url: sitemap.admin.users,
            roles: ["admin"],
            icon: "UsersRound",
        },
        {
            title: "Manage Activities",
            url: sitemap.admin.manageActivities,
            roles: ["admin"],
            icon: "CalendarDays",
        },
        {
            title: "Configurations",
            url: "/u/a/configurations",
            roles: ["admin", "dev"],
            icon: "Settings2",
        },
        {
            title: "Role Permissions",
            url: "/u/a/roles",
            roles: ["admin", "dev"],
            icon: "ShieldUser",
        },
        {
            title: "Manage Applications",
            url: "/u/a/applications",
            roles: ["admin", "dev"],
            icon: "ClipboardList",
        },
        {
            title: "Provider Requests",
            url: "/u/a/provider-requests",
            roles: ["admin", "dev"],
            icon: "UserPlus",
        },
    ]

    const devLinks = [
        ...adminLinks,
        {
            title: "Audit Logs",
            url: sitemap.admin.auditLogs,
            roles: ["dev"],
            icon: "History",
        },
        {
            title: "Ticket Orders",
            url: sitemap.admin.ticketOrders,
            roles: ["dev"],
            icon: "FolderClock",
        },
        {
            title: "System Errors",
            url: sitemap.admin.errorLogs,
            roles: ["dev"],
            icon: "Bug",
        },
        {
            title: "Dev Config",
            url: "/u/a/dev-settings",
            roles: ["dev"],
            icon: "Settings2",
        },
    ]

    const navlinks = user?.role === ROLES.DEV ? devLinks : user?.role === ROLES.ADMIN ? adminLinks : user?.role === ROLES.BOUNCER ? bouncerLinks : user?.role === ROLES.ORGANIZER ? organizerLinks : user?.role === ROLES.TEAM_MANAGER ? teamManagerLinks : userLinks

    return (
        <SidebarProvider>
            <AppSidebar links={navlinks} />
            <main className='w-full bg-[#020202] text-white'>
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}

export default UserLayout
