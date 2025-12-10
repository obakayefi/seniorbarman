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


type SidebarLink = {
  title: string;
  url: string,
  icon: React.ComponentType
}

export function AppSidebar({ links }: { links: SidebarLink[] }) {
  return (
    <Sidebar>
      <SidebarContent>
          <div className="pt-2 pb-0 p-2 border-b-2 bg-white flex items-center justify-center">
              <Link href={'/'}>
                  <div>
                      <Image src={'/logo-clear.svg'} alt='logo' height={75} width={200} />
                  </div>
              </Link>
          </div>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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