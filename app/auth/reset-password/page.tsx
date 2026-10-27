"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import useInput from "@/hooks/useInput"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import axios from "axios"

export default function ResetPassword() {
    const [isLoading, setIsLoading] = useState(false)
    const email = useInput('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.value) return

        setIsLoading(true)
        try {
            console.log('Attempting to send reset link for:', email.value)
            const { data } = await axios.post('/api/auth/forgot-password', {
                email: String(email.value).trim()
            })
            toast.success(data.message || "Reset link sent to your email")
            email.reset()
        } catch (error: any) {
            console.error('Forgot password error:', error)
            const errorMsg = error.response?.data?.error || "Failed to send reset link"
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
                        Reset Password
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Enter your account email and we will send you a password recovery link
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email.value ?? ""}
                            onChange={email.onChange}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="pt-2 space-y-4">
                        <Button
                            type="submit"
                            className="w-full h-10 rounded-sm bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading || !email.value}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Spinner /> Sending link...
                                </span>
                            ) : (
                                "Send Recovery Link"
                            )}
                        </Button>

                        <div className="flex items-center justify-between text-xs pt-2">
                            <Link
                                href="/auth/login"
                                className="text-muted-foreground hover:text-foreground hover:underline transition-colors font-medium"
                            >
                                &larr; Back to Login
                            </Link>

                            <Link
                                href="/auth/register"
                                className="text-orange-500 hover:text-orange-400 hover:underline transition-colors font-semibold"
                            >
                                Create an account
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
