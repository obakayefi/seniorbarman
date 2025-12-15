// "use client"
import useUser from "@/hooks/useUser";
import AuthNavActions from "@/components/auth/AuthNavActions";

export default async function UserNavDetail({ isLoggedIn }: {isLoggedIn: boolean}) {
    const {users} = await useUser()
    return (
        <AuthNavActions users={users}  />
    )
}