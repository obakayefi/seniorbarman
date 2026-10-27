"use client"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { PasswordStrength } from "@/components/ui/password-strength"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import useInput from "@/hooks/useInput"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import axios from "axios"

export default function ResetPasswordFulfillment() {
    const [isLoading, setIsLoading] = useState(false)
    const password = useInput('')
    const confirmPassword = useInput('')
    const router = useRouter()
    const { token } = useParams()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password.value !== confirmPassword.value) {
            toast.error("Passwords do not match")
            return
        }

        if (password.value.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setIsLoading(true)
        try {
            const { data } = await axios.post('/api/auth/reset-password', {
                token: String(token),
                password: password.value
            })
            toast.success("Password reset successful! Please login.")
            router.push('/auth/login')
        } catch (error: any) {
            console.error('Reset password fulfillment error:', error)
            const errorMsg = error.response?.data?.error || "Failed to reset password"
            toast.error(errorMsg)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-card/95 dark:bg-zinc-950/90 backdrop-blur-md border border-border dark:border-zinc-800 rounded-sm p-6 sm:p-8 shadow-xl dark:shadow-black/40 transition-all">
                <div className="mb-6 space-y-1.5">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Set New Password
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Enter and confirm your new secure password
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                New Password
                            </Label>
                            <PasswordInput
                                id="password"
                                placeholder="Create new password"
                                value={password.value ?? ""}
                                onChange={password.onChange}
                                required
                                autoComplete="new-password"
                            />
                            <PasswordStrength password={password.value} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                Confirm Password
                            </Label>
                            <PasswordInput
                                id="confirmPassword"
                                placeholder="Re-enter your password"
                                value={confirmPassword.value ?? ""}
                                onChange={confirmPassword.onChange}
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <div className="pt-2 space-y-4">
                        <Button
                            type="submit"
                            className="w-full h-10 rounded-sm bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading || !password.value || !confirmPassword.value}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Spinner /> Resetting password...
                                </span>
                            ) : (
                                "Update Password"
                            )}
                        </Button>

                        <div className="text-center pt-1">
                            <Link
                                href="/auth/login"
                                className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
                            >
                                &larr; Back to Login
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
