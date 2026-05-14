import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TicketOrder from "@/models/TicketOrder";
import User from "@/models/User";
import { getUserFromCookie } from "@/lib/auth";
import { HunchoRoleChecker } from "@/lib/helpers";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await connectDB();
        const user = await getUserFromCookie();
        const canAccessResource = HunchoRoleChecker(user?.role)

        if (!canAccessResource) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ orders: [] }, { status: 200 });
        }

        // Find user by email
        const userEmail = await User.findOne({ email }).lean();
        if (!userEmail) {
            return NextResponse.json({ orders: [] }, { status: 200 });
        }

        // Find orders associated with user
        const orders = await TicketOrder.find({ user: userEmail._id })
            .populate('event', 'title homeTeam awayTeam date type image')
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, orders }, { status: 200 });

    } catch (error: any) {
        console.error("Fetch ticket orders error:", error);
        return NextResponse.json(
            { error: "Failed to fetch ticket orders: " + error.message },
            { status: 500 }
        );
    }
}
