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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import useInput from "@/hooks/useInput"
import api from "@/lib/axios"
import axios from "axios"
import Link from "next/link"
import { redirect } from "next/navigation"
import { FormEvent, useState } from "react"
import { toast } from "sonner"

export default function CreateAdmin() {
    const [isLoading, setIsLoading] = useState(false)
    const [roleType, setRoleType] = useState<'bouncer' | 'admin'>('bouncer')
    const email = useInput('')
    const firstName = useInput('')
    const lastName = useInput('')
    // const phoneNumber = useState('')

    const formFilled = email.value && firstName.value && lastName.value && roleType

    const onAdminCreate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const newEmployee = {
                email: email.value,
                firstName: firstName.value,
                lastName: lastName.value,
                role: roleType
            }
            const createdAdmin = await api.post('/admin', newEmployee)            
            // const createdUser = await axios.post('/api/auth/register', { ...newUser }, { withCredentials: true })
            // // empty the form
            firstName.reset()
            lastName.reset()
            email.reset()
            // password.reset()
            toast.success(createdAdmin.data.message)

            //show toaster 
            // toast.success(`${createdUser.data.user.firstName} your account has been created, wait while we redirect you`)

            // then redirect user
            // setTimeout(() => redirect('/auth/login'), 2000)
        } catch (error: any) {
            console.error('Error registering user', { error: error.message })
        } finally {
            setIsLoading(false)
        }

    }


    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="w-full mx-4 md:mx-0 border-zinc-800 max-w-lg">
                <CardHeader className="mb-10">
                    <h1 className="md:text-3xl text-white text-2xl">Create Admin</h1>
                    <p className="text-gray-400 md:text-normal text-sm">
                        Forge a new admin and bless them with rights
                    </p>
                    <CardAction>
                        <Button className={'text-zinc-400'} variant="link" onClick={() => redirect('/auth/login')} >Login</Button>
                    </CardAction>
                </CardHeader>
                <form onSubmit={onAdminCreate}>
                    <CardContent>
                        <div className="flex flex-col gap-6 text-zinc-400">
                            <div className="grid gap-2">
                                <Label htmlFor="email">First Name</Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    className={'border-zinc-800'}
                                    autoComplete="false"
                                    placeholder="John"
                                    value={firstName.value}
                                    onChange={firstName.onChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2 ">
                                <Label htmlFor="email">Last Name</Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    className={'border-zinc-800'}
                                    placeholder="Doe"
                                    value={lastName.value}
                                    onChange={lastName.onChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2 ">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    className={'border-zinc-800'}
                                    type="email"
                                    placeholder="johndoe@example.com"
                                    value={email.value}
                                    onChange={email.onChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                {/* <div className="flex items-center">
                                <Label htmlFor="password">Password</Label> */}
                                {/* <Link
                                    href="/auth/reset-password"
                                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                >
                                    Forgot your password?
                                </Link> */}
                                {/* </div> */}
                                {/* <Input
                                id="password"
                                type="password"
                                placeholder="* * * * * * * *"
                                required
                                onChange={password.onChange}
                                value={password.value}
                            /> */}
                                <Select
                                    value={roleType}
                                    onValueChange={(value: 'bouncer' | 'admin') => { setRoleType(value); }}
                                >
                                    <SelectTrigger className="w-full border-zinc-800">
                                        <SelectValue placeholder="Select Event Type" />
                                    </SelectTrigger>
                                    <SelectContent className={'border-zinc-800'}>
                                        <SelectItem value="bouncer">Bouncer</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col mt-6 gap-2">
                        <Button
                            type="submit"
                            disabled={isLoading || !formFilled}
                            className="w-full disabled:bg-slate-600"
                        >
                            Register New Admin {isLoading ? <Spinner /> : null}
                        </Button>
                    </CardFooter>
                </form>
            </Card >
        </div>
    )
}
