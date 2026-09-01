"use client"

import { LogOut, Sparkles, ChevronsUpDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { getInitials } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import { useState } from "react"
import { ChangePasswordModal } from "@/components/features/auth/ChangePasswordModal"

export function NavUser() {
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
            <SidebarMenuButton size="lg" className="p-2 text-foreground hover:bg-muted py-4 data-[state=open]:bg-muted transition-colors">
              <section className="flex flex-col">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user?.name} />
                  <AvatarFallback className="rounded-lg bg-orange-500 text-white font-bold">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </section>
              <div className="grid flex-1 text-foreground text-left text-sm leading-tight">
                <div className="flex items-center gap-1">
                  <span className="truncate font-medium">{user.name}</span>
                  {((user?.role === 'bouncer') || (user?.role === 'admin') || (user?.role === 'dev') || (user?.role === 'organizer')) ? <span className="truncate text-[10px] p-1 px-2 rounded text-muted-foreground uppercase bg-muted">{user.role}</span> : null}
                </div>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) z-110 bg-card border-border text-card-foreground min-w-56 rounded-lg shadow-lg" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
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
        <ChangePasswordModal isOpen={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen} />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
