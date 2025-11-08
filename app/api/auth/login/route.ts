import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { connectDB } from "@/lib/mongodb";
import User from '@/models/User'
import { error } from "console";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
    try {
        await connectDB()
        const { email, password } = await req.json()

        // console.log({ email, password })

        if (!email || !password) {
            return NextResponse.json({
                error: "Email and password are required"
            },
                {
                    status: 401
                })
        }

        const user = await User.findOne({ email })
        // console.log({user})
        if (!user) {
            return NextResponse.json({ error: "Invalid or password" }, { status: 401 })
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
        }

        const token = signToken({ id: user._id, email: user.email })

        const res = NextResponse.json({
            success: true,
            message: "Login successful",
            token,
            user: { id: user._id, firstName: user.firstName }
        })

        res.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            path: "/",
            maxAge: 86400
        })
        return res
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Login failed", details: error.message },
            { status: 500 }
        );
    }
}

