import { useApp } from '@/context/AppContext'
import { getUserFromCookie } from '@/lib/auth'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
    children: React.ReactNode
}

const AdminLayout = async ({ children }: Props) => {
    const user = await getUserFromCookie()


    if (user?.role !== "admin" && user?.role !== "bouncer") 
        redirect('/no-access')

    return (
        <div>{children}</div>
    )
}

export default AdminLayout