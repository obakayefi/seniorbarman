"use client"
import { NavUser } from "./nav-user"

const SidebarFooterWrap = () => {
    return (
        <div className="bg-zinc-900 p-2 hover:bg-zinc-850 duration-400 rounded px-4 text-slate-800">
            <section className="flex items-center gap-2">
                <NavUser />
            </section>
        </div>
    )
}

export default SidebarFooterWrap