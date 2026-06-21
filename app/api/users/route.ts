import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { verifyAuth } from "@/lib/auth";
import User from "@/models/User";
import { paginate } from "@/lib/pagination";

export async function GET(req: Request) {
    try {
        await connectDB()
        await verifyAuth()

        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page");
        const limit = searchParams.get("limit") || "10";
        
        // Simple filtering example based on role
        const role = searchParams.get("role");
        const query = role ? { role } : {};

        const paginatedResult = await paginate(User, query, { page, limit });
        
        return NextResponse.json(
            { 
                users: paginatedResult.data,
                pagination: paginatedResult.pagination 
            }, 
            { status: 200 } // Changed status from 201 to 200 for a GET request
        )

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