import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import { requireRole } from "@/lib/requireRole";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const authResult = await requireRole(["admin", "dev"]);
    if (authResult instanceof NextResponse) return authResult;
    try {
        const body = await req.json();
        await connectDB();
        const updated = await Team.findByIdAndUpdate(params.id, body, { new: true });
        if (!updated) return NextResponse.json({ error: "Team not found" }, { status: 404 });
        return NextResponse.json({ success: true, team: updated });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update team", details: error.message }, { status: 500 });
    }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const team = await Team.findById(params.id).populate("managers", "firstName lastName email");
        if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
        return NextResponse.json({ success: true, team });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch team", details: error.message }, { status: 500 });
    }
}
