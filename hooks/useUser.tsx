"use server"
import { getUserFromCookie } from '@/lib/auth'

const useUser = async () => {
    const users = await getUserFromCookie()

    return {
        users
    }
}

export default useUser