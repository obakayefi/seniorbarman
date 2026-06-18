import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { getUserFromCookie } from "@/lib/auth";
import { HunchoRoleChecker } from "@/lib/helpers";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
    try {
        const user = await getUserFromCookie();
        const canAccessResource = HunchoRoleChecker(user?.role);

        if (!canAccessResource) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const key = formData.get("key") as string;
        const imageFile = formData.get("imageFile") as File;

        if (!key || !imageFile) {
            return NextResponse.json({ error: "Key and imageFile are required." }, { status: 400 });
        }

        await connectDB();

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult: any = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: "seniorbarman_settings" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        const imageUrl = uploadResult.secure_url;

        const updatedSetting = await Setting.findOneAndUpdate(
            { key },
            { value: imageUrl },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, setting: updatedSetting });
    } catch (error: any) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
