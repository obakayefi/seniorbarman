import React from 'react'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


const UserLayout = ({ children }: { children: React.ReactNode }) => {
    let user = {
        authenticated: true,
        role: 'user'
    }

    if (!user.authenticated) redirect('/auth/login')

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className='w-full'>
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>        
    )
}

export default UserLayout

