"use client"
import { Calendar, CalendarDays, Home, Inbox, PowerIcon, ScanQrCode, Search, Settings, Tickets } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { NavUser } from "./ui/nav-user"
import SidebarFooterWrap from "./ui/SidebarFooterWrap"
import { useApp } from "@/context/AppContext"
import Image from "next/image";
import Link from "next/link";
import React from "react";

// const items = [
//   {
//     title: "Home",
//     url: "#",
//     icon: Home,
//   },
//   {
//     title: "Inbox",
//     url: "#",
//     icon: Inbox,
//   },
//   {
//     title: "Calendar",
//     url: "#",
//     icon: Calendar,
//   },
//   {
//     title: "Search",
//     url: "#",
//     icon: Search,
//   },
//   {
//     title: "Settings",
//     url: "#",
//     icon: Settings,
//   },
// ]


import { Bug, CalendarPlus, ClipboardList, FolderKanban, History, LayoutDashboard, Settings2, ShieldUser, Sparkles, UserPlus, UsersRound } from "lucide-react"
import { BiParty } from 'react-icons/bi'
import { TbSoccerField } from 'react-icons/tb'

type SidebarLink = {
  title: string;
  url: string,
  icon: string // Changed from React.ComponentType to string
}

const IconMap: Record<string, React.ComponentType> = {
  LayoutDashboard,
  BiParty,
  TbSoccerField,
  Tickets,
  ScanQrCode,
  Sparkles,
  ShieldUser,
  CalendarPlus,
  UsersRound,
  History,
  Bug,
  Settings2,
  CalendarDays,
  FolderKanban,
  ClipboardList,
  UserPlus,
}

import { toast } from "sonner"
import { useState } from "react"
import { HunchoRoleChecker } from "@/lib/helpers"

export function AppSidebar({ links }: { links: SidebarLink[] }) {
  const [dotState, setDotState] = useState(0) // 0: green, 1: blinking, 2: purple
  const [isUpdating, setIsUpdating] = useState(false)
  const { user } = useApp()
  const isHuncho = HunchoRoleChecker(user?.role || "")
  const handleDotClick = async (e: any) => {
    e.preventDefault()
    if (isUpdating) return

    if (dotState === 0) {
      setDotState(1)
    } else if (dotState === 1) {
      setDotState(2)
    } else if (dotState === 2) {
      setIsUpdating(true)
      try {
        const res = await fetch("/api/users/dev-mode", { method: "POST" })
        const data = await res.json()

        if (res.ok) {
          toast.success("Level Switched")
          setDotState(0) // Reset after success
        } else {
          toast.error(data.error || "Failed to switch level")
        }
      } catch (error) {
        toast.error("Network error")
      } finally {
        setIsUpdating(false)
      }
    }
  }

  return (
    <Sidebar className={'z-100'}>
      <SidebarHeader className="border-b border-white/5 py-4 z-50">
        {isHuncho && (<div className="px-4 z-10">
          <button
            onClick={(e) => handleDotClick(e)}
            type="button"
            className="flex items-center gap-2 group bg-transparent border-none p-0 outline-none w-full text-left"
          >
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 pointer-events-none ${dotState === 0
                ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                : dotState === 1
                  ? "bg-lime-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                  : "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                } ${isUpdating ? "opacity-50 animate-spin" : "group-hover:scale-110"}`}
              title="System Active"
            />
            <span className="text-[10px] mt-1 font-black uppercase tracking-widest text-zinc-500 select-none pointer-events-none">System Active</span>
          </button>
        </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <div className="pt-2 pb-0 invisible p-2 border-b-2 border-zinc-900 bg-zinc-950 flex items-center justify-center">
          <Link href={'/'}>
            <div>
              <Image src={'/logo-clear.svg'} alt='logo' height={75} width={200} />
            </div>
          </Link>
        </div>
        <SidebarGroup className={'text-zinc-600'}>
          <SidebarGroupLabel className={'text-zinc-500'}>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => {
                const Icon = IconMap[item.icon] || LayoutDashboard
                return (
                  <SidebarMenuItem key={item.title} className={'text-zinc-200'}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              {/* <SidebarMenuItem className={'text-zinc-200'}>
                <SidebarMenuButton asChild>
                  <a href="/u/a/events/manage">
                    <CalendarDays className="w-4 h-4" />
                    <span>Manage Activities</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className={'text-zinc-200'}>
                <SidebarMenuButton asChild>
                  <a href="/u/a/ticket-orders">
                    <Tickets className="w-4 h-4" />
                    <span>Ticket Orders</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterWrap />
      </SidebarFooter>
    </Sidebar>
  )
}