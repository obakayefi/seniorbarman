import { getUserFromCookie } from '@/lib/auth'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = { children: React.ReactNode }

const OrganizerLayout = async ({ children }: Props) => {
    const user = await getUserFromCookie()

    if (user?.role !== "organizer" && user?.role !== "admin" && user?.role !== "dev")
        redirect('/no-access')

    return (
        <div className={'bg-[#020202]'}>{children}</div>
    )
}

export default OrganizerLayout
