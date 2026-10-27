import { getUserFromCookie } from '@/lib/auth'
import { redirect } from 'next/navigation'
import React from 'react'
import { ROLE_GROUPS } from '@/lib/roles'

type Props = { children: React.ReactNode }

const OrganizerLayout = async ({ children }: Props) => {
    const user = await getUserFromCookie()

    if (!user || !ROLE_GROUPS.CAN_CREATE_EVENT.includes(user.role as any))
        redirect('/no-access')

    return (
        <div className={'bg-background text-foreground transition-colors min-h-screen'}>{children}</div>
    )
}

export default OrganizerLayout
