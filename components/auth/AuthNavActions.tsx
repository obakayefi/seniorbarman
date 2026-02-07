"use client"
import { NavbarButton } from "@/components/ui/resizable-navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NButton from "@/components/native/NButton";

const UserIsLoggedIn = () => {
    const router = useRouter();
    return (
        <div className="flex items-center gap-4">
            <NButton className={'cursor-pointer bg-white text-zinc-900'} onClick={() => router.push('/auth/logout')}>Logout</NButton>
        </div>
    )
}

const UserIsLoggedOut = () => {
    const router = useRouter();
    return (
        <div className="flex items-center gap-4">
            <NavbarButton onClick={() => router.push('/auth/login')} variant="secondary">Login</NavbarButton>
            <NavbarButton
                onClick={() => router.push('/auth/register')}
                variant="primary"
                className={'text-black'}>
                Create Account
            </NavbarButton>
        </div>
    )
}

export default function AuthNavActions({ users }: { users: {} | null }) {
    return (
        <>
            {users ? <UserIsLoggedIn /> : <UserIsLoggedOut />}
        </>
    )
}