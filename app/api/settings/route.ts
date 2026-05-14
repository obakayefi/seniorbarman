import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { getUserFromCookie } from "@/lib/auth";
import { HunchoRoleChecker } from "@/lib/helpers";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const settings = await Setting.find({});
        const configMap: Record<string, any> = {};
        settings.forEach(s => configMap[s.key] = s.value);
        return NextResponse.json({ success: true, settings: configMap });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getUserFromCookie();
        const canAccessResource = HunchoRoleChecker(user?.role)

        if (!canAccessResource) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { key, value } = await req.json();

        if (typeof key !== 'string') {
            return NextResponse.json({ error: "Invalid key format." }, { status: 400 });
        }

        await connectDB();

        const updatedSetting = await Setting.findOneAndUpdate(
            { key },
            { value },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, setting: updatedSetting });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
