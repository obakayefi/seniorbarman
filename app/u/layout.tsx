import React from 'react'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar, SidebarGroupItem } from "@/components/app-sidebar"
import { CalendarDays, CalendarPlus, History as HistoryIcon, LayoutDashboard, PartyPopper, ScanQrCode, ShieldUser, Sparkles, Tickets, UserPlus, UsersRound, Bug, Settings2, FolderKanban, ClipboardList, FolderClock } from 'lucide-react'
import { getUserFromCookie } from '@/lib/auth'
import { sitemap } from '@/lib/utils'
import { ROLES } from '@/lib/roles'
import { GiSoccerField } from "react-icons/gi";
import { TbSoccerField } from 'react-icons/tb'
import { BiParty } from 'react-icons/bi'

const UserLayout = async ({ children }: { children: React.ReactNode }) => {
    const user = await getUserFromCookie()

    if (!user) redirect('/auth/logout')

    const role = user.role;

    let groups: SidebarGroupItem[] = [];

    if (role === ROLES.DEV || role === ROLES.ADMIN) {
        groups = [
            {
                groupLabel: "Overview",
                items: [
                    { title: "Dashboard", url: sitemap.admin.dashboard, icon: "LayoutDashboard" },
                ]
            },
            {
                groupLabel: "Discovery & Tickets",
                items: [
                    { title: "Upcoming Events", url: sitemap.user.eventsTicketPurchase, icon: "BiParty" },
                    { title: "Upcoming Matches", url: "/teams", icon: "TbSoccerField" },
                    { title: "Tickets", url: sitemap.user.tickets, icon: "Tickets" },
                    { title: "My Applications", url: "/u/applications", icon: "ClipboardList" },
                ]
            },
            {
                groupLabel: "Management & Operations",
                items: [
                    { title: "Manage Activities", url: sitemap.admin.manageActivities, icon: "CalendarDays" },
                    { title: "Create Events", url: sitemap.admin.createEvent, icon: "CalendarPlus" },
                    { title: "Event Applicants", url: "/u/a/applications", icon: "ClipboardList" },
                    { title: "Scanner", url: sitemap.bouncer.scanner, icon: "ScanQrCode" },
                    { title: "Ticket Grant Wizard", url: sitemap.admin.ticketGrantWizard, icon: "Sparkles" },
                ]
            },
            {
                groupLabel: "System & Administration",
                items: [
                    { title: "User Management", url: sitemap.admin.users, icon: "UsersRound" },
                    { title: "Create Admin", url: sitemap.admin.createAdmin, icon: "ShieldUser" },
                    { title: "Provider Requests", url: "/u/a/provider-requests", icon: "UserPlus" },
                    { title: "Configurations", url: "/u/a/configurations", icon: "Settings2" },
                    { title: "Role Permissions", url: "/u/a/roles", icon: "ShieldUser" },
                    ...(role === ROLES.DEV ? [
                        { title: "Audit Logs", url: sitemap.admin.auditLogs, icon: "History" },
                        { title: "Ticket Orders", url: sitemap.admin.ticketOrders, icon: "FolderClock" },
                        { title: "System Errors", url: sitemap.admin.errorLogs, icon: "Bug" },
                        { title: "Dev Config", url: "/u/a/dev-settings", icon: "Settings2" },
                    ] : [])
                ]
            }
        ];
    } else if (role === ROLES.ORGANIZER) {
        groups = [
            {
                groupLabel: "Overview",
                items: [
                    { title: "Dashboard", url: sitemap.organizer.dashboard, icon: "LayoutDashboard" },
                ]
            },
            {
                groupLabel: "Event Management",
                items: [
                    { title: "My Events", url: "/u/organizer/events/manage", icon: "FolderKanban" },
                    { title: "Create Event", url: sitemap.organizer.createEvent, icon: "CalendarPlus" },
                    { title: "Event Applicants", url: "/u/a/applications", icon: "ClipboardList" },
                    { title: "Scanner", url: sitemap.bouncer.scanner, icon: "ScanQrCode" },
                ]
            },
            {
                groupLabel: "Discovery & Personal",
                items: [
                    { title: "Upcoming Events", url: sitemap.user.eventsTicketPurchase, icon: "BiParty" },
                    { title: "Tickets", url: sitemap.user.tickets, icon: "Tickets" },
                    { title: "My Applications", url: "/u/applications", icon: "ClipboardList" },
                ]
            }
        ];
    } else if (role === ROLES.TEAM_MANAGER) {
        groups = [
            {
                groupLabel: "Overview",
                items: [
                    { title: "Dashboard", url: "/u/tm/dashboard", icon: "LayoutDashboard" },
                ]
            },
            {
                groupLabel: "Activities & Management",
                items: [
                    { title: "Manage Activities", url: "/u/organizer/events/manage", icon: "FolderKanban" },
                    { title: "Create Event", url: sitemap.organizer.createEvent, icon: "CalendarPlus" },
                    { title: "Activity Log", url: "/u/tm/audit", icon: "History" },
                    { title: "Scanner", url: sitemap.bouncer.scanner, icon: "ScanQrCode" },
                    { title: "Ticket Grant Wizard", url: "/u/tm/ticket-grant-wizard", icon: "Sparkles" },
                ]
            },
            {
                groupLabel: "Matches & Tickets",
                items: [
                    { title: "Upcoming Matches", url: sitemap.user.rangersTicketPurchase, icon: "TbSoccerField" },
                    { title: "Tickets", url: sitemap.user.tickets, icon: "Tickets" },
                ]
            }
        ];
    } else if (role === ROLES.BOUNCER) {
        groups = [
            {
                groupLabel: "Overview",
                items: [
                    { title: "Dashboard", url: sitemap.user.dashboard, icon: "LayoutDashboard" },
                    { title: "Scanner", url: sitemap.bouncer.scanner, icon: "ScanQrCode" },
                ]
            },
            {
                groupLabel: "Personal",
                items: [
                    { title: "Upcoming Events", url: sitemap.user.eventsTicketPurchase, icon: "BiParty" },
                    { title: "Upcoming Matches", url: "/teams", icon: "TbSoccerField" },
                    { title: "Tickets", url: sitemap.user.tickets, icon: "Tickets" },
                    { title: "My Applications", url: "/u/applications", icon: "ClipboardList" },
                ]
            }
        ];
    } else {
        // General User
        groups = [
            {
                groupLabel: "Overview",
                items: [
                    { title: "Dashboard", url: sitemap.user.dashboard, icon: "LayoutDashboard" },
                ]
            },
            {
                groupLabel: "Events & Matches",
                items: [
                    { title: "Upcoming Events", url: sitemap.user.eventsTicketPurchase, icon: "BiParty" },
                    { title: "Upcoming Matches", url: "/teams", icon: "TbSoccerField" },
                ]
            },
            {
                groupLabel: "My Account",
                items: [
                    { title: "Tickets", url: sitemap.user.tickets, icon: "Tickets" },
                    { title: "My Applications", url: "/u/applications", icon: "ClipboardList" },
                ]
            }
        ];
    }

    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar groups={groups} />
            <main className='w-full bg-background text-foreground min-h-screen transition-colors'>
                <SidebarTrigger className="m-2 text-foreground" />
                {children}
            </main>
        </SidebarProvider>
    )
}

export default UserLayout
