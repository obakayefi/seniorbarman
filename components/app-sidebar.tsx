"use client"
import { Calendar, CalendarDays, Home, Inbox, PowerIcon, ScanQrCode, Search, Settings, Tickets, FolderClock } from "lucide-react"
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
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/axios";

import { Bug, CalendarPlus, ClipboardList, FolderKanban, History, LayoutDashboard, Settings2, ShieldUser, Sparkles, UserPlus, UsersRound } from "lucide-react"
import { BiParty } from 'react-icons/bi'
import { TbSoccerField } from 'react-icons/tb'

export type SidebarLink = {
  title: string;
  url: string;
  icon: string;
}

export type SidebarGroupItem = {
  groupLabel: string;
  items: SidebarLink[];
}

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
  FolderClock,
}

import { toast } from "sonner"
import { HunchoRoleChecker } from "@/lib/helpers"

export function AppSidebar({ groups, links }: { groups?: SidebarGroupItem[]; links?: SidebarLink[] }) {
  const pathname = usePathname();
  const [dotState, setDotState] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [favTeamId, setFavTeamId] = useState<string | null>(null);
  const { user } = useApp();
  const isHuncho = HunchoRoleChecker(user?.role || "");

  // Fallback to single group if legacy links prop provided
  const sidebarGroups: SidebarGroupItem[] = groups || [
    { groupLabel: "Navigation", items: links || [] }
  ];

  useEffect(() => {
    const fetchFavTeam = async () => {
      try {
        let id: string | null = null;
        if (user?.id) {
          const res = await api.get("/user/favorite-team").catch(() => null);
          id = res?.data?.favoriteTeam?._id || res?.data?.favoriteTeam || null;
        }
        if (!id && typeof window !== "undefined") {
          id = localStorage.getItem("favoriteTeamId");
        }
        setFavTeamId(id);
      } catch (e) {
        setFavTeamId(null);
      }
    };
    fetchFavTeam();

    window.addEventListener("storage", fetchFavTeam);
    return () => window.removeEventListener("storage", fetchFavTeam);
  }, [user]);

  const handleDotClick = async (e: any) => {
    e.preventDefault();
    if (isUpdating) return;

    if (dotState === 0) {
      setDotState(1);
    } else if (dotState === 1) {
      setDotState(2);
    } else if (dotState === 2) {
      setIsUpdating(true);
      try {
        const res = await fetch("/api/users/dev-mode", { method: "POST" });
        const data = await res.json();

        if (res.ok) {
          toast.success("Level Switched");
          setDotState(0);
        } else {
          toast.error(data.error || "Failed to switch level");
        }
      } catch (error) {
        toast.error("Network error");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <Sidebar className={'z-100'}>
      <SidebarHeader className="border-b border-zinc-800/60 py-4 z-50">
        {isHuncho && (
          <div className="px-4 z-10">
            <button
              onClick={(e) => handleDotClick(e)}
              type="button"
              className="flex items-center gap-2 group bg-transparent border-none p-0 outline-none w-full text-left cursor-pointer"
            >
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 pointer-events-none ${
                  dotState === 0
                    ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                    : dotState === 1
                    ? "bg-lime-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                    : "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                } ${isUpdating ? "opacity-50 animate-spin" : "group-hover:scale-110"}`}
                title="System Active"
              />
              <span className="text-[10px] mt-1 font-black uppercase tracking-widest text-zinc-500 select-none pointer-events-none">
                System Active
              </span>
            </button>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="sidebar-custom-scroll">
        <div className="pt-2 pb-0 invisible p-2 bg-zinc-950 flex items-center justify-center">
          <Link href={'/'}>
            <div>
              <Image src={'/logo-clear.svg'} alt='logo' height={75} width={200} />
            </div>
          </Link>
        </div>

        {sidebarGroups.map((group, groupIdx) => (
          <SidebarGroup key={`group-${groupIdx}`} className="text-zinc-600 py-2">
            <SidebarGroupLabel className="text-zinc-500 uppercase tracking-widest text-[10px] font-extrabold px-3 mb-1.5">
              {group.groupLabel}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-1">
                {group.items.map((item) => {
                  const Icon = IconMap[item.icon] || LayoutDashboard;

                  const isSportsLink =
                    item.title.toLowerCase().includes("matches") ||
                    item.title.toLowerCase().includes("rangers") ||
                    item.url.includes("/teams") ||
                    item.url.includes("/rangers");

                  const targetUrl = isSportsLink
                    ? favTeamId
                      ? `/teams/${favTeamId}`
                      : "/teams"
                    : item.url;

                  const displayTitle = isSportsLink ? "Upcoming Matches" : item.title;

                  const isActive =
                    pathname === targetUrl ||
                    (targetUrl !== "/" && pathname.startsWith(targetUrl)) ||
                    (isSportsLink && pathname.startsWith("/teams"));

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`relative flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-zinc-800/90 text-white font-extrabold shadow-md shadow-black/40 border border-white/10"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 font-medium"
                        }`}
                      >
                        <Link href={targetUrl} className="w-full flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-orange-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                            <span className="text-xs">{displayTitle}</span>
                          </div>

                          {/* Solid active dot indicator (pulse animation removed) */}
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] shrink-0" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarFooterWrap />
      </SidebarFooter>
    </Sidebar>
  );
}