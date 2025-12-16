import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";


export async function GET() {
    try {
        await connectDB()
        // await verifyAuth()

        const token = (await cookies()).get('token')?.value

        if (!token) {
            return NextResponse.json({ user: null })
        }
        const decoded = verifyToken(token)
        return NextResponse.json({ user: decoded }, { status: 201 })

    } catch (error: any) {
        return NextResponse.json({
            error: "Can't get profile info"
        },
            {
                status: 401
            }
        )
    }
}