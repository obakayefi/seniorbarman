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
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import useInput from "@/hooks/useInput"
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast } from "sonner"

export default function Login() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const email = useInput('')
    const password = useInput('')

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

            toast.success('Welcome back ' + data.user.firstName)

            router.replace('/user/events')
        } catch (error: any) {
            console.error('Error signing player in', { error: error.message })
            toast.error('Invalid email or password')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full mx-6 max-w-lg">
            <CardHeader className="mb-10">
                <h1 className="md:text-3xl text-2xl">Login to your account</h1>
                <p className="text-gray-400 text-sm md:text-normal">
                    Enter your email below to login to your account
                </p>
                <CardAction>
                    <Button variant="link" onClick={() => router.push('/auth/register')} >Sign Up</Button>
                </CardAction>
            </CardHeader>
            <form onSubmit={onLoginSubmit}>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={String(email.value ?? "")}
                                onChange={email.onChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="/auth/reset-password"
                                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                value={password.value}
                                onChange={password.onChange}
                                type="password"
                                required
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button type="submit" disabled={isLoading || !formFilled} className="mt-6 disabled:bg-slate-400 w-full">
                        Login {isLoading ? <Spinner /> : null}
                    </Button>
                    {/* <Button variant="outline" className="w-full">
                    Login with Google
                    </Button> */}
                </CardFooter>
            </form>
        </Card>
    )
}
