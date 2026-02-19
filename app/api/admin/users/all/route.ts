import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromCookie } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const admin = await getUserFromCookie();
        if (!admin || admin.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const users = await User.find({}).sort({ createdAt: -1 }).select("-password");

        return NextResponse.json({ success: true, users });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
