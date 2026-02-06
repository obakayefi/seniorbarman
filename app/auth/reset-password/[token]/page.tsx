"use client"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import useInput from "@/hooks/useInput"
import { useRouter, useParams } from "next/navigation"
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
            console.log('Fulfilling password reset for token:', token)
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
        <Card className="w-full mx-4 md:mx-0 border-neutral-800 max-w-lg">
            <CardHeader className="mb-10">
                <h1 className="lg:text-3xl md:text-3xl text-white text-2xl">Confirm New Password</h1>
                <p className="text-gray-400 md:text-normal text-sm">
                    Enter your new secure password below
                </p>
            </CardHeader>
            <CardContent>
                <form id="fulfillment-form" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="* * * * * * * *"
                                value={password.value ?? ""}
                                onChange={password.onChange}
                                className="text-white bg-zinc-950"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="* * * * * * * *"
                                value={confirmPassword.value ?? ""}
                                onChange={confirmPassword.onChange}
                                className="text-white bg-zinc-950"
                                required
                            />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col mt-6 gap-2">
                <Button
                    form="fulfillment-form"
                    type="submit"
                    className="w-full disabled:bg-zinc-800"
                    disabled={isLoading || !password.value || !confirmPassword.value}
                >
                    Reset Password {isLoading && <Spinner />}
                </Button>
            </CardFooter>
        </Card>
    )
}
