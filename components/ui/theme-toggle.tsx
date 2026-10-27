"use client"
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle({ className = "" }: { className?: string }) {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button
                className={`p-2 rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-400 opacity-50 ${className}`}
                disabled
            >
                <Sun className="h-4 w-4" />
            </button>
        )
    }

    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`p-2 rounded-full border transition-all duration-200 ${
                isDark 
                    ? "border-zinc-700 bg-zinc-800 text-amber-400 hover:bg-zinc-700 hover:border-zinc-600" 
                    : "border-zinc-300 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 hover:border-zinc-400"
            } ${className}`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
        >
            {isDark ? <Sun className="h-4 w-4 transition-transform duration-300 rotate-0" /> : <Moon className="h-4 w-4 transition-transform duration-300 rotate-0" />}
        </button>
    )
}
