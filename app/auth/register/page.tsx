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
import { redirect } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast } from "sonner"

export default function Register() {
    const [isLoading, setIsLoading] = useState(false)
    const email = useInput('')
    const firstName = useInput('')
    const lastName = useInput('')
    // const phoneNumber = useState('')
    const password = useInput('')

    const formFilled = email.value && password.value && firstName.value && lastName.value
    
    const onRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const newUser = {
                email: email.value,
                password: password.value,
                firstName: firstName.value,
                lastName: lastName.value
            }
            console.log({ newUser })
            const createdUser = await axios.post('/api/auth/register', {...newUser}, { withCredentials: true })
            console.log({createdUser})
            // empty the form
            firstName.reset()
            lastName.reset()
            email.reset()
            password.reset()
            

            //show toaster 
            // toast.success(`${createdUser.data.user.firstName} your account has been created, wait while we redirect you`)
            toast.success(`Your account has been created, login to continue`)

            // then redirect user
            setTimeout(() => redirect('/auth/login'), 2000)
        } catch (error: any) {
            console.error('Error registering user', { error: error.message })
        } finally {
            setIsLoading(false)
        }

    }


    return (
        <Card className="w-full mx-4 md:mx-0 max-w-lg">
            <CardHeader className="mb-10">
                <h1 className="md:text-3xl text-2xl">Create an account</h1>
                <p className="text-gray-400 md:text-normal text-sm">
                    Put in your details to get a new account
                </p>
                <CardAction>
                    <Button variant="link" onClick={() => redirect('/auth/login')} >Login</Button>
                </CardAction>
            </CardHeader>
            <form onSubmit={onRegisterSubmit}>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">First Name</Label>
                            <Input
                                id="firstName"
                                type="text"
                                autoComplete="false"
                                placeholder="John"
                                value={firstName.value}
                                onChange={firstName.onChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Last Name</Label>
                            <Input
                                id="firstName"
                                type="text"
                                placeholder="Doe"
                                value={lastName.value}
                                onChange={lastName.onChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="johndoe@example.com"
                                value={email.value}
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
                                type="password"
                                placeholder="* * * * * * * *"
                                required
                                onChange={password.onChange}
                                value={password.value}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex-col mt-6 gap-2">
                    <Button
                        type="submit"
                        disabled={isLoading || !formFilled}
                        className="w-full disabled:bg-slate-600"
                    >
                        Register {isLoading ? <Spinner /> : null}
                    </Button>
                </CardFooter>
            </form>
        </Card >
    )
}
