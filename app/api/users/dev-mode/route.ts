import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromCookie } from "@/lib/auth";
import User from "@/models/User";

export async function POST() {
    try {
        await connectDB();
        const sessionUser = await getUserFromCookie();

        if (!sessionUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findById(sessionUser.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        user.role = "dev";
        await user.save();

        return NextResponse.json({ message: "Level Switched", role: user.role });
    } catch (error: any) {
        console.error("Dev mode error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
