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
        if (s === 3) return "bg-yellow-500"
        if (s === 4) return "bg-green-500"
        return "bg-neutral-800"
    }

    return (
        <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-400">Password Strength</span>
                <span className={cn("text-xs font-medium uppercase tracking-wider",
                    strength <= 1 ? "text-red-500" :
                        strength === 2 ? "text-orange-500" :
                            strength === 3 ? "text-yellow-500" :
                                "text-green-500"
                )}>
                    {getLabel(strength)}
                </span>
            </div>
            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className={cn(
                            "h-full flex-1 transition-all duration-300",
                            step <= strength ? getColor(strength) : "bg-neutral-800"
                        )}
                    />
                ))}
            </div>
            <p className="text-[10px] text-neutral-500 leading-tight">
                Use 8+ characters with a mix of letters, numbers & symbols.
            </p>
        </div>
    )
}

export { PasswordStrength }
