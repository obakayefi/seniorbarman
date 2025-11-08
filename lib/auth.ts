import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

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