import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import { requireRole } from "@/lib/requireRole";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const teams = await Team.find({}).sort({ name: 1 });
        return NextResponse.json(
            { success: true, teams },
            {
                headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0",
                }
            }
        );
    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to fetch teams", details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const authResult = await requireRole(["admin", "dev"]);
    if (authResult instanceof NextResponse) return authResult;

    try {
        const { teams } = await req.json();

        if (!Array.isArray(teams)) {
            return NextResponse.json({ error: "Invalid data format. Expected an array of teams." }, { status: 400 });
        }

        await connectDB();

        let insertedCount = 0;

        for (const teamData of teams) {
            const exists = await Team.findOne({ name: teamData.name });
            if (!exists) {
                await Team.create({
                    name: teamData.name,
                    logo: teamData.icon || teamData.logo || "/clubs/rangers-logo.png",
                    stadium: teamData.stadium || ""
                });
                insertedCount++;
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully processed teams. Inserted ${insertedCount} new teams.`
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to bulk upload teams", details: error.message },
            { status: 500 }
        );
    }
}
