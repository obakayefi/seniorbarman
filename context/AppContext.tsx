"use client"
import api from "@/lib/axios";
import { IUser } from "@/types/components"
import { createContext, useContext, useState, ReactNode, useEffect } from "react"

type AppContextType = {
    user: IUser | null;
    setUser: (user: IUser | null) => void;
    loading: boolean;
    // logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<IUser | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true)
            try {
                const _user = await api.get('/auth/me')
                // console.log({_user})
                setUser(_user.data.user)
            } catch (error: any) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    return (
        <AppContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (!context) throw new Error('useApp must be used within an AppProvider')
    return context
}