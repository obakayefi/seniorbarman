"use client"
import { NavUser } from "./nav-user"

const SidebarFooterWrap = () => {
    return (
        <div className="bg-zinc-800 p-2 hover:bg-gray-400/30 duration-400 rounded px-4 text-slate-800">
            <section className="flex items-center gap-2">
                <NavUser />
            </section>
        </div>
    )
}

export default SidebarFooterWrap