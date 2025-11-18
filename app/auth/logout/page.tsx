'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { } from '@/lib/auth' // adjust the import path
import api from '@/lib/axios'
import { useApp } from '@/context/AppContext'
import { IUser } from '@/types/components'

export default function Logout() {
    const router = useRouter()
    const { setUser } = useApp()

    useEffect(() => {
        const handleLogout = async () => {
            try {
                const result = await api.post("/auth/logout")
                console.log({ result })
                setUser({} as IUser)
                router.replace('/auth/login') // or wherever you want to send them
            } catch (error) {
                console.error('Logout failed:', error)
            }
        }

        handleLogout()
    }, [router])

    return <div>Logging you out...</div>
}
