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
import { useRouter } from "next/navigation"
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
        <Card className="w-full mx-4 md:mx-0 border-neutral-800 max-w-lg">
            <CardHeader className="mb-10">
                <div className={'flex sm:flex-row-reverse justify-between flex-col '}>
                    <div className={'border border-zinc-900 mb-4'}>
                        <Button className={'text-white'} variant="link" onClick={() => router.push('/auth/register')} >Sign Up</Button>
                    </div>
                    <div>
                        <h1 className="lg:text-3xl md:text-3xl text-white text-2xl">Reset your account</h1>
                        <p className="text-gray-400 md:text-normal text-sm">
                            With your email you can easily recover your account
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form id="reset-form" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-zinc-400">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email.value ?? ""}
                                onChange={email.onChange}
                                className="text-white bg-zinc-950"
                                required
                            />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button
                    form="reset-form"
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800"
                    disabled={isLoading || !email.value}
                >
                    Send Reset Link {isLoading && <Spinner />}
                </Button>
                <Button
                    variant="link"
                    className="text-zinc-500 text-sm"
                    onClick={() => router.push('/auth/login')}
                >
                    Back to Login
                </Button>
            </CardFooter>
        </Card>
    )
}
