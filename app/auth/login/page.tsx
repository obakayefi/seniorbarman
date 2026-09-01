"use client"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useApp } from "@/context/AppContext"
import useInput from "@/hooks/useInput"
import { sitemap } from "@/lib/utils"
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast } from "sonner"
import { HunchoRoleChecker } from "@/lib/helpers"

export default function Login() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const email = useInput('')
    const password = useInput('')
    const { setUser } = useApp()

    const formFilled = email.value && password.value

    const onLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const payload = {
                email: email.value,
                password: password.value
            }

            const { data } = await axios.post(
                "/api/auth/login",
                { ...payload },
                {
                    withCredentials: true
                }
            )
            setUser(data.user)
            toast.success('Welcome back ' + data.user.firstName)

            // Application Intent
            const intentRaw = localStorage.getItem('pendingApplication')
            if (intentRaw) {
                try {
                    const intent = JSON.parse(intentRaw)
                    toast("Continue your application?", {
                        description: `You were applying for ${intent.eventTitle}.`,
                        action: {
                            label: "Continue Application",
                            onClick: () => router.push(`/events/${intent.eventId}`)
                        },
                        duration: 10000,
                    })
                    // Fall back to default dashboard if they ignore the toast
                    if (HunchoRoleChecker(data.user.role)) router.replace(sitemap.admin.dashboard)
                    else if (data.user.role === 'organizer') router.replace(sitemap.organizer.dashboard)
                    else router.replace(sitemap.user.dashboard)
                    return;
                } catch (e) {}
            }

            // Default Role-based redirection
            if (HunchoRoleChecker(data.user.role)) {
                router.replace(sitemap.admin.dashboard)
            } else if (data.user.role === 'organizer') {
                router.replace(sitemap.organizer.dashboard)
            } else {
                router.replace(sitemap.user.dashboard)
            }
        } catch (error: any) {
            console.error('Error signing player in', { error: error.message })
            const errorMsg = error.response?.data?.error || "Invalid email or password"
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
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Enter your credentials to access your account
                    </p>
                </div>

                <form onSubmit={onLoginSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={String(email.value ?? "")}
                                onChange={email.onChange}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                    Password
                                </Label>
                                <Link
                                    href="/auth/reset-password"
                                    className="text-xs font-medium text-orange-500 hover:text-orange-400 hover:underline transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <PasswordInput
                                id="password"
                                placeholder="••••••••"
                                value={password.value}
                                onChange={password.onChange}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <div className="pt-2 space-y-4">
                        <Button
                            type="submit"
                            disabled={isLoading || !formFilled}
                            className="w-full h-10 rounded-sm bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Spinner /> Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </Button>

                        <div className="relative flex items-center justify-center">
                            <div className="w-full border-t border-border/60 dark:border-zinc-800" />
                            <span className="bg-card dark:bg-zinc-950 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground absolute">
                                New to Senior Barman?
                            </span>
                        </div>

                        <p className="text-sm text-center text-muted-foreground pt-2">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/auth/register"
                                className="text-orange-500 hover:text-orange-400 hover:underline font-bold transition-colors"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
