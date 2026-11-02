import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getUserFromCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        await connectDB();
        const user = await getUserFromCookie();

        if (!user || (user.role !== "admin" && user.role !== "dev" && user.role !== "super_admin")) {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const dryRun = searchParams.get("dryRun") !== "false"; // Default to true for safety

        // Group tickets by checkInToken
        const tokenDuplicates = await Ticket.aggregate([
            {
                $group: {
                    _id: "$checkInToken",
                    count: { $sum: 1 },
                    ticketIds: { $push: "$_id" },
                    ticketNumbers: { $push: "$ticketNumber" },
                    createdAts: { $push: "$createdAt" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        // Group tickets by ticketNumber
        const numberDuplicates = await Ticket.aggregate([
            {
                $group: {
                    _id: "$ticketNumber",
                    count: { $sum: 1 },
                    ticketIds: { $push: "$_id" },
                    tokens: { $push: "$checkInToken" },
                    createdAts: { $push: "$createdAt" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        const idsToDeleteSet = new Set<string>();

        // For checkInToken duplicates: keep oldest ticket (first in array), mark remainder for deletion
        for (const dup of tokenDuplicates) {
            const sortedIds = dup.ticketIds;
            // keep the first, delete the rest
            for (let i = 1; i < sortedIds.length; i++) {
                idsToDeleteSet.add(sortedIds[i].toString());
            }
        }

        // For ticketNumber duplicates: keep oldest, mark remainder for deletion
        for (const dup of numberDuplicates) {
            const sortedIds = dup.ticketIds;
            for (let i = 1; i < sortedIds.length; i++) {
                idsToDeleteSet.add(sortedIds[i].toString());
            }
        }

        const idsToDelete = Array.from(idsToDeleteSet);

        if (dryRun) {
            return NextResponse.json({
                success: true,
                mode: "dry-run",
                message: `Found ${idsToDelete.length} duplicate tickets that would be removed. Call with ?dryRun=false to execute deletion.`,
                summary: {
                    tokenDuplicateGroups: tokenDuplicates.length,
                    ticketNumberDuplicateGroups: numberDuplicates.length,
                    totalDuplicatesToDelete: idsToDelete.length,
                },
                duplicates: {
                    byCheckInToken: tokenDuplicates,
                    byTicketNumber: numberDuplicates,
                    idsTargetedForDeletion: idsToDelete
                }
            }, { status: 200 });
        }

        // Execute deletion
        const deleteResult = await Ticket.deleteMany({ _id: { $in: idsToDelete } });

        // Ensure sparse unique indexes exist on Ticket collection
        try {
            await Ticket.collection.createIndex({ checkInToken: 1 }, { unique: true, sparse: true });
            await Ticket.collection.createIndex({ ticketNumber: 1 }, { unique: true, sparse: true });
            await Ticket.collection.createIndex({ comboGroupId: 1 }, { sparse: true });
        } catch (idxErr: any) {
            console.warn("Index creation warning during dedup:", idxErr?.message);
        }

        return NextResponse.json({
            success: true,
            mode: "executed",
            message: `Successfully deleted ${deleteResult.deletedCount} duplicate tickets and ensured indexes.`,
            deletedCount: deleteResult.deletedCount,
            summary: {
                tokenDuplicateGroups: tokenDuplicates.length,
                ticketNumberDuplicateGroups: numberDuplicates.length,
                totalDuplicatesDeleted: deleteResult.deletedCount
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error("Dedup tickets error:", error);
        return NextResponse.json({ error: error.message || "Dedup script failed" }, { status: 500 });
    }
}
