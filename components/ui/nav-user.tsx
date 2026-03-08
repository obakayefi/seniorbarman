"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { getInitials } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import { useState } from "react"
import { ChangePasswordModal } from "@/components/features/auth/ChangePasswordModal"

export function NavUser(
  // user,
  // logoutAction
  // }: {
  //   user: {
  //     name: string
  //     email: string
  //     avatar: string,
  //     role: string
  //   },
  // logoutAction: () => void;
) {
  const { isMobile } = useSidebar()

  const { user } = useApp()
  const router = useRouter()
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  if (!user) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-zinc-950 p-2 text-zinc-200 hover:bg-zinc-800 py-4  data-[state=open]:text-zinc-950"
            >
              <section className="flex flex-col">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user?.name} />
                  <AvatarFallback className="rounded-lg text-zinc-900">{getInitials(user.name)}</AvatarFallback>
                </Avatar>

              </section>
              <div className="grid flex-1 text-zinc-200 text-left text-sm leading-tight">
                <div className="flex items-center gap-1">
                  <span className="truncate font-medium">{user.name}</span>
                  {((user?.role === 'bouncer') || (user?.role === 'admin')) ? <span className="truncate text-[10px] p-1 px-2 rounded text-gray-400 uppercase">{user.role}</span> : null}
                </div>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) bg-zinc-900 border-zinc-800 text-zinc-200 min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {/* <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg text-zinc-900">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel> */}
            {/* <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}>
              <Sparkles />
              Change password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/auth/logout')}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onOpenChange={setIsChangePasswordOpen}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
