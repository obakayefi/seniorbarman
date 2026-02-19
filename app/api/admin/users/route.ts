import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

import { recordAuditLog } from "@/lib/audit";

// POST: Admin creates or looks up a user by email
export async function POST(req: Request) {
    try {
        await connectDB();

        const admin = await getUserFromCookie();
        if (!admin || admin.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized: Admin access required" },
                { status: 401 }
            );
        }

        const { firstName, lastName, email, password } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

        if (existingUser) {
            return NextResponse.json({
                success: true,
                isNew: false,
                message: "User already exists",
                user: {
                    _id: existingUser._id,
                    firstName: existingUser.firstName,
                    lastName: existingUser.lastName,
                    email: existingUser.email,
                }
            });
        }

        // Create new user
        if (!firstName || !lastName || !password) {
            return NextResponse.json(
                { error: "First name, last name, and password are required to create a new user" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: "user"
        });

        // Record Audit Log
        await recordAuditLog({
            adminId: admin.id,
            action: "CREATE_USER",
            targetType: "USER",
            targetId: newUser._id.toString(),
            details: {
                userEmail: newUser.email,
                userName: `${firstName} ${lastName}`
            }
        });

        return NextResponse.json({
            success: true,
            isNew: true,
            message: "User created successfully",
            user: {
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error("Admin user creation error:", error);
        return NextResponse.json(
            { error: "Failed to process user: " + error.message },
            { status: 500 }
        );
    }
}

// GET: Search users by email (for autocomplete/lookup)
export async function GET(req: Request) {
    try {
        await connectDB();

        const admin = await getUserFromCookie();
        if (!admin || admin.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized: Admin access required" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email || email.length < 3) {
            return NextResponse.json({ success: true, users: [] });
        }

        const users = await User.find({
            email: { $regex: email.trim(), $options: "i" }
        })
            .select("_id firstName lastName email")
            .limit(5);

        return NextResponse.json({ success: true, users });

    } catch (error: any) {
        console.error("Admin user search error:", error);
        return NextResponse.json(
            { error: "Failed to search users: " + error.message },
            { status: 500 }
        );
    }
}
