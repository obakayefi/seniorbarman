import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromCookie } from "@/lib/auth";
import { HunchoRoleChecker } from "@/lib/helpers";
import { paginate } from "@/lib/pagination";

export async function GET(req: Request) {
    try {
        const user = await getUserFromCookie();
        const canAccessResource = HunchoRoleChecker(user?.role)

        if (!canAccessResource) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        
        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page");
        const limit = searchParams.get("limit") || "10";
        const searchTerm = searchParams.get("search");

        const query: any = {};
        if (searchTerm) {
            query.$or = [
                { email: { $regex: searchTerm, $options: 'i' } },
                { firstName: { $regex: searchTerm, $options: 'i' } },
                { lastName: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        const paginatedResult = await paginate(User, query, { 
            page, 
            limit, 
            sort: { createdAt: -1 },
            select: "-password"
        });

        return NextResponse.json({ 
            success: true, 
            users: paginatedResult.data,
            pagination: paginatedResult.pagination
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
