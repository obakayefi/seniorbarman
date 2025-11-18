"use server"
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { verifyToken } from './jwt'
import axios from 'axios'
import api from './axios'
import { IUser } from '@/types/components'

const JWT_SECRET = process.env.JWT_SECRET ?? "SECRET"

export async function verifyAuth() {
    const cookieStore = cookies()
    const token = (await cookieStore).get("token")?.value

    if (!token) throw new Error('Unauthorized! No token provided')

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        return decoded
    } catch (error: any) {
        throw new Error("Unauthorized: Invalid or expired token")
    }
}

export async function getUserFromCookie() {
    const cookieStore = cookies()
    const token = (await cookieStore).get('token')?.value

    if (!token) return null

    try {
        const user = verifyToken(token) as IUser
        return {
            email: user.email,
            role: user.role,
            id: user.id,
            name: user.name,
        }
    } catch (error: any) {
        return null
    }
}

// export async function logUserOut () {
//     try {
//         console.log("User server logout")
//         const result = await api.post("/auth/logout", {}, { withCredentials: true })
//         console.log({result});
//         return result
//     } catch (error: any) {
//         console.error('Error logging user out: ' + error.message)
//         return null
//     }
// }

// export function verifyToken(req: Request) {
//     const authHeader = req.headers.get("authorization")
//     if (!authHeader || !authHeader.startsWith("Bearer ")) return null
//     const token = authHeader.split(" ")[1]
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET)
//         // console.log({ decoded })
//         return decoded
//     } catch (error: any) {
//         return null
//     }
// }