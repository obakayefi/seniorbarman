import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getUserFromCookie } from "@/lib/auth";
import Notification from "@/models/Notification";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        await connectDB();
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const notifications = await Notification.find({ user: user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({ notifications }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await connectDB();
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { notificationId, markAllAsRead } = await req.json();

        if (markAllAsRead) {
            await Notification.updateMany({ user: user.id, isRead: false }, { isRead: true });
        } else if (notificationId) {
            await Notification.findOneAndUpdate({ _id: notificationId, user: user.id }, { isRead: true });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
