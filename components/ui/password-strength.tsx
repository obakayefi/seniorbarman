"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
    password?: string
}

const PasswordStrength = ({ password = "" }: PasswordStrengthProps) => {
    const getStrength = (pass: string) => {
        let score = 0
        if (!pass) return score
        if (pass.length >= 8) score++
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++
        if (/\d/.test(pass)) score++
        if (/[^a-zA-Z\d]/.test(pass)) score++
        return score
    }

    const strength = getStrength(password)

    const getLabel = (s: number) => {
        if (password.length === 0) return ""
        if (s <= 1) return "Weak"
        if (s === 2) return "Fair"
        if (s === 3) return "Good"
        if (s === 4) return "Strong"
        return ""
    }

    const getColor = (s: number) => {
        if (s <= 1) return "bg-red-500"
        if (s === 2) return "bg-orange-500"
        if (s === 3) return "bg-amber-400"
        if (s === 4) return "bg-emerald-500"
        return "bg-muted"
    }

    return (
        <div className="space-y-1.5 mt-2">
            <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Password Strength</span>
                <span className={cn("font-bold tracking-wide uppercase text-[11px]",
                    strength <= 1 ? "text-red-500" :
                        strength === 2 ? "text-orange-500" :
                            strength === 3 ? "text-amber-400" :
                                "text-emerald-500"
                )}>
                    {getLabel(strength)}
                </span>
            </div>
            <div className="h-1.5 w-full bg-muted dark:bg-zinc-800/80 rounded-full overflow-hidden flex gap-1 p-0.5">
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className={cn(
                            "h-full flex-1 rounded-full transition-all duration-300",
                            step <= strength ? getColor(strength) : "bg-transparent"
                        )}
                    />
                ))}
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
                Use 8+ characters with a mix of letters, numbers & symbols.
            </p>
        </div>
    )
}

export { PasswordStrength }
