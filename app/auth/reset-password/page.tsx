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
import useInput from "@/hooks/useInput"
import Link from "next/link"
import { redirect } from "next/navigation"

export default function ResetPassword() {
    const email = useInput('')

    return (
        <Card className="w-full mx-4 md:mx-0  max-w-lg">
            <CardHeader className="mb-10">
                <h1 className="text-3xl md:text-3xl text-2xl">Reset your account</h1>
                <p className="text-gray-400 md:text-normal text-sm">
                    With your email you can easily recover your account
                </p>
                <CardAction>
                    <Button variant="link" onClick={() => redirect('/auth/register')} >Sign Up</Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email.value}
                                onChange={email.onChange}
                                required
                            />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full">
                    Reset Password
                </Button>
            </CardFooter>
        </Card>
    )
}
