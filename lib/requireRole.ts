import { cookies } from "next/headers";
import jwt from 'jsonwebtoken'
import { NextResponse } from "next/server";
import { verifyToken } from "./jwt";

export async function requireRole(allowedRoles: string[]) {
    const token = (await cookies()).get("token")?.value as string

    if (!token) {
        NextResponse.json(
            { error: "Unauthorized: No token provided" },
            { status: 401 }
        )
    }

    try {
        const decoded = verifyToken(token)
        if (typeof decoded === "string") {
            throw new Error("Invalid token")
        }

        if (!allowedRoles.includes((decoded as any).role)) {
            return NextResponse.json(
                { error: "Forbidden: Insufficient role permissions" },
                { status: 403 }
            )
        }

        return decoded as { id: string; email: string; role: string }
    } catch (error: any) {
        return NextResponse.json(
            { error: "Invalid or expired token" },
            { status: 401 }
        )
    }
}