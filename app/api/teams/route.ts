import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";
import { requireRole } from "@/lib/requireRole";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const teams = await Team.find({})
            .populate("managers", "firstName lastName email role")
            .sort({ name: 1 });
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
        const body = await req.json();
        await connectDB();

        // Handle array for bulk insert
        if (Array.isArray(body.teams)) {
            let insertedCount = 0;
            for (const teamData of body.teams) {
                const exists = await Team.findOne({ name: teamData.name });
                if (!exists) {
                    await Team.create({
                        name: teamData.name,
                        logo: teamData.icon || teamData.logo || "/clubs/rangers-logo.png",
                        stadium: teamData.stadium || "",
                        description: teamData.description || "",
                        managers: teamData.managers || [],
                        ticketTypes: teamData.ticketTypes || []
                    });
                    insertedCount++;
                }
            }
            return NextResponse.json({ 
                success: true, 
                message: `Successfully processed teams. Inserted ${insertedCount} new teams.`
            });
        }

        // Single team creation
        const { name, logo, stadium, description, managers, ticketTypes } = body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json({ error: "Team name is required" }, { status: 400 });
        }

        const existingTeam = await Team.findOne({ name: name.trim() });
        if (existingTeam) {
            return NextResponse.json({ error: `A team named '${name.trim()}' already exists` }, { status: 400 });
        }

        const newTeam = await Team.create({
            name: name.trim(),
            logo: logo || "/clubs/rangers-logo.png",
            stadium: stadium || "",
            description: description || "",
            managers: Array.isArray(managers) ? managers : [],
            ticketTypes: Array.isArray(ticketTypes) ? ticketTypes : []
        });

        const populatedTeam = await Team.findById(newTeam._id).populate("managers", "firstName lastName email role");

        return NextResponse.json({
            success: true,
            team: populatedTeam,
            message: "Team created successfully"
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json(
            { error: "Failed to process team request", details: error.message },
            { status: 500 }
        );
    }
}
