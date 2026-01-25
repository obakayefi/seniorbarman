"use client"
import {NavbarButton} from "@/components/ui/resizable-navbar";
import {redirect} from "next/navigation";
import Link from "next/link";
import NButton from "@/components/native/NButton";

const UserIsLoggedIn = () => {
    return (
        <div className="flex items-center gap-4">
            <Link href={"/auth/logout"}>
                <NButton className={'cursor-pointer bg-white text-zinc-900'} onClick={() => redirect('/auth/logout')}>Logout</NButton>
            </Link>
        </div> 
    )
}

const UserIsLoggedOut = () => {
    return (
        <div className="flex items-center gap-4">
            <NavbarButton onClick={() => redirect('/auth/login')} variant="secondary">Login</NavbarButton>
            <NavbarButton
                onClick={() => redirect('/auth/register')}
                variant="primary"
                className={'text-black'}>
                Create Account
            </NavbarButton>
        </div>
    )
}

export default function AuthNavActions({users}: {users: {} | null}) {
    return (
        <>
            {users ? <UserIsLoggedIn />  : <UserIsLoggedOut />}
        </>
    )
}