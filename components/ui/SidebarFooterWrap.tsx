"use client"
import { NavUser } from "./nav-user"
import { Database } from "lucide-react"
import { getUserFromCookie } from "@/lib/auth"
import { useApp } from "@/context/AppContext"
import { useDevFeatures } from "@/lib/devFeatures"

const SidebarFooterWrap = () => {
    const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
    const dbName = isStaging ? 'event-booking-db-staging' : 'event-booking-db';
    const { user } = useApp()
    const { showDbTag } = useDevFeatures();

    return (
        <div className="flex flex-col gap-2">
            {(user?.role === "admin" || user?.role === "dev") && showDbTag ? (
                <div className="bg-zinc-900 p-2 text-xs flex items-center gap-2 text-zinc-500 rounded">
                    <Database className="w-3 h-3" />
                    <span className="truncate">{dbName}</span>
                </div>
            ) : null}
            <div className="bg-zinc-900 p-2 hover:bg-zinc-850 duration-400 rounded px-4 text-slate-800">
                <section className="flex items-center gap-2">
                    <NavUser />
                </section>
            </div>
        </div>
    )
}

export default SidebarFooterWrap
