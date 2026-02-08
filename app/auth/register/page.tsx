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

export default function Register() {
    const router = useRouter()
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
            // console.log({ newUser })
            const createdUser = await axios.post('/api/auth/register', { ...newUser }, { withCredentials: true })
            // onsole.log({createdUser})
            // empty the form
            firstName.reset()
            lastName.reset()
            email.reset()
            password.reset()


            //show toaster 
            // toast.success(`${createdUser.data.user.firstName} your account has been created, wait while we redirect you`)
            toast.success(`Your account has been created, login to continue`)

            // then redirect user
            setTimeout(() => router.push('/auth/login'), 2000)
        } catch (error: any) {
            console.error('Error registering user', { error: error.message })
            const errorMsg = error.response?.data?.error || "Registration failed"
            toast.error(errorMsg)
        } finally {
            setIsLoading(false)
        }

    }


    return (
        <Card className="w-full text-neutral-300 mx-4 border-neutral-800 md:mx-0 max-w-lg">
            <CardHeader className="mb-10">
                {/*<h1 className="md:text-3xl text-white text-2xl">Create an account</h1>*/}
                {/*<p className="text-gray-400 md:text-normal text-sm">*/}
                {/*    Put in your details to get a new account*/}
                {/*</p>*/}
                {/*<CardAction className={'border border-zinc-900'}>*/}
                {/*    <Button */}
                {/*        variant="link" */}
                {/*        className={'text-neutral-400 '}*/}
                {/*        onClick={() => redirect('/auth/login')} >Login</Button>*/}
                {/*</CardAction>*/}
                <div className={'flex sm:flex-row-reverse justify-between flex-col'}>
                    <div className={'border border-zinc-900 mb-4'}>
                        <Button className={'text-neutral-400  bg-transparent w-full px-2'} variant="link"
                            onClick={() => router.push('/auth/login')}>Login to your account</Button>
                    </div>
                    <div>
                        <h1 className="md:text-3xl text-slate-100 text-2xl">Create an account</h1>
                        <p className="text-gray-400 text-sm md:text-normal">
                            Put in your details to get a new account
                        </p>
                    </div>
                </div>
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
                                    className="ml-auto inline-block text-zinc-700 text-underline text-sm underline-offset-4 hover:underline"
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
