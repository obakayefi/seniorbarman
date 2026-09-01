"use client"
import { NavUser } from "./nav-user"
import { Database } from "lucide-react"
import { useApp } from "@/context/AppContext"
import { useDevFeatures } from "@/lib/devFeatures"
import { ROLE_GROUPS } from "@/lib/roles"

const SidebarFooterWrap = () => {
    const isStaging = process.env.NEXT_PUBLIC_ENV === 'staging' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
    const dbName = isStaging ? 'event-booking-db-staging' : 'event-booking-db';
    const { user } = useApp()
    const { showDbTag } = useDevFeatures();

    return (
        <div className="flex flex-col gap-2">
            {ROLE_GROUPS.ELEVATED.includes(user?.role as any) && showDbTag ? (
                <div className="bg-muted dark:bg-zinc-900 p-2 text-xs flex items-center gap-2 text-muted-foreground dark:text-zinc-500 rounded border border-border dark:border-zinc-800">
                    <Database className="w-3 h-3" />
                    <span className="truncate">{dbName}</span>
                </div>
            ) : null}
            <div className="bg-muted dark:bg-zinc-900 border border-border dark:border-zinc-800 p-2 hover:bg-muted/80 dark:hover:bg-zinc-850 duration-400 rounded px-4 text-foreground dark:text-slate-100 transition-colors">
                <section className="flex items-center gap-2">
                    <NavUser />
                </section>
            </div>
        </div>
    )
}

export default SidebarFooterWrap
