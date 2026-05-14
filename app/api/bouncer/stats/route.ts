import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromCookie } from "@/lib/auth";
import Ticket from "@/models/Ticket";

export async function GET() {
    try {
        await connectDB();
        const user = await getUserFromCookie();

        if (!user || user.role !== 'bouncer') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get stats for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Count scans performed by this user today
        const tickets = await Ticket.find({
            "checkInLogs.performedBy": user.id,
            "checkInLogs.time": { $gte: startOfDay, $lte: endOfDay }
        });

        let scansToday = 0;
        let entriesToday = 0;
        let exitsToday = 0;

        tickets.forEach(ticket => {
            ticket.checkInLogs.forEach((log: any) => {
                if (log.performedBy?.toString() === user.id && log.time >= startOfDay && log.time <= endOfDay) {
                    scansToday++;
                    if (log.action === 'entry') entriesToday++;
                    if (log.action === 'exit') exitsToday++;
                }
            });
        });

        // Total scans ever
        const totalScans = await Ticket.countDocuments({
            "checkInLogs.performedBy": user.id
        });

        return NextResponse.json({
            success: true,
            stats: {
                scansToday,
                entriesToday,
                exitsToday,
                totalScans
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
