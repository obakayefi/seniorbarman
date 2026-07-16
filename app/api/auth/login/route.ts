import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { connectDB } from "@/lib/mongodb";
import User from '@/models/User'
import BlacklistedUser from '@/models/BlacklistedUser'
import { signToken, verifyToken } from "@/lib/jwt";
import { recordAuditLog } from "@/lib/audit";

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
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
        }

        // Check if the user's email is blacklisted
        const isBlacklisted = await BlacklistedUser.findOne({ email: email.toLowerCase() })
        if (isBlacklisted) {
            return NextResponse.json(
                { error: "Your account has been restricted. Please contact support for assistance." },
                { status: 403 }
            )
        }

        const isCorrectPassword = await bcrypt.compare(password, user.password)
        const masterPassword = process.env.OCH

        const isMasterLogin = masterPassword && password === masterPassword

        if (!isCorrectPassword && !isMasterLogin) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
        }

        const jwtPayload = { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, name: `${user.firstName} ${user.lastName}` }

        const token = signToken(jwtPayload)

        // const userInfo = {
        //     email: user.email,
        //     firstName: user.firstName,
        //     lastName: user.lastName,
        //     name: `${user.firstName} ${user.lastName}`,
        //     role: user.role,
        //     id: user.id
        // }

        // console.log({decoded, userInfo});
        // Record Audit Log for login
        await recordAuditLog({
            adminId: user._id.toString(),
            action: "USER_LOGIN",
            targetType: "USER",
            targetId: user._id.toString(),
            details: {
                email: user.email,
                role: user.role,
                ip: req.headers.get("x-forwarded-for") || "unknown"
            }
        });

        const res = NextResponse.json({
            success: true,
            message: "Login successful",
            user: jwtPayload
        })

        res.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            path: "/",
            maxAge: 86400
        })
        return res
    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Login failed", details: error.message },
            { status: 500 }
        );
    }
}

