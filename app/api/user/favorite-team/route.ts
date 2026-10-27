import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Team from "@/models/Team";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ success: true, favoriteTeam: null });
        }

        const decoded = verifyToken(token) as any;
        if (!decoded || !decoded.id) {
            return NextResponse.json({ success: true, favoriteTeam: null });
        }

        await connectDB();
        const user = await User.findById(decoded.id).populate("favoriteTeam").lean();

        return NextResponse.json({
            success: true,
            favoriteTeam: user?.favoriteTeam || null,
        });
    } catch (error: any) {
        console.error("GET /api/user/favorite-team error:", error);
        return NextResponse.json({ error: "Failed to fetch favorite team" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = verifyToken(token) as any;
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { teamId } = await req.json();

        await connectDB();

        if (teamId) {
            const teamExists = await Team.findById(teamId);
            if (!teamExists) {
                return NextResponse.json({ error: "Team not found" }, { status: 404 });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            { favoriteTeam: teamId || null },
            { new: true }
        ).populate("favoriteTeam").lean();

        return NextResponse.json({
            success: true,
            message: teamId ? "Favorite team updated successfully" : "Favorite team cleared",
            favoriteTeam: updatedUser?.favoriteTeam || null,
        });
    } catch (error: any) {
        console.error("POST /api/user/favorite-team error:", error);
        return NextResponse.json({ error: "Failed to update favorite team" }, { status: 500 });
    }
}
