import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs'
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
    try {
        await connectDB()
        const { email, password, firstName, lastName } = await req.json()

        if (!email || !password)
            return NextResponse.json({ error: "Email and password required" }, { status: 400 })

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        const _user = {
            email,
            password: hashedPassword,
            firstName,
            lastName
        }
        //console.log({email, [password]: hashedPassword, firstName, lastName })
        const newUser = await User.create(_user)
        const token = signToken({ id: newUser._id, email: newUser.email, firstName: newUser.firstName })

        const res = NextResponse.json({
            success: true,
            message: "Registration successful",
        })
        
        res.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60
        })
        
        return res 
    } catch (error: any) {
        console.error("Registration Error:", error)
        return NextResponse.json(
            { error: "Registration failed", details: error.message },
            { status: 500 }
        )
    }
}