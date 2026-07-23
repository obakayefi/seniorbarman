import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs'
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import BlacklistedUser from "@/models/BlacklistedUser";
import ProviderAccountRequest from "@/models/ProviderAccountRequest";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
    try {
        await connectDB()
        const { email, password, firstName, lastName, intendedRole, teamId, organizationName } = await req.json()

        if (!email || !password)
            return NextResponse.json({ error: "Email and password required" }, { status: 400 })

        // Check blacklist before allowing any registration
        const isBlacklisted = await BlacklistedUser.findOne({ email: email.toLowerCase() })
        if (isBlacklisted) {
            return NextResponse.json(
                { error: "This email address is not permitted to register on this platform." },
                { status: 403 }
            )
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            // Provider applicants start as 'user' until admin approves
            role: "user"
        })

        const isProviderRole = intendedRole === "organizer" || intendedRole === "team_manager"

        if (isProviderRole) {
            // Create a pending provider account request
            await ProviderAccountRequest.create({
                userId: newUser._id,
                email: newUser.email,
                role: intendedRole,
                teamId: teamId || undefined,
                organizationName: organizationName || undefined,
                status: "pending",
            })
        }

        const token = signToken({ id: newUser._id, email: newUser.email, firstName: newUser.firstName })

        const res = NextResponse.json({
            success: true,
            message: isProviderRole
                ? "Account created. Your provider application is pending admin approval."
                : "Registration successful",
            isPendingApproval: isProviderRole,
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