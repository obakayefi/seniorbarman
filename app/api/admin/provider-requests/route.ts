import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ProviderAccountRequest from "@/models/ProviderAccountRequest";
import { requireRole } from "@/lib/requireRole";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const authResult = await requireRole(["admin", "dev"]);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status") || "pending";

        await connectDB();
        const requests = await ProviderAccountRequest.find({ status })
            .populate("userId", "firstName lastName email createdAt")
            .populate("teamId", "name logo")
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, requests });
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch provider requests", details: error.message },
            { status: 500 }
        );
    }
}
