import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";

export async function GET() {
    try {
        // Auth Check - Admin only
        const user = await getUserFromCookie();
        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: "Unauthorized: Admin access required" },
                { status: 401 }
            );
        }

        // Collect environment variables (safe subset)
        const envVars = {
            // Deployment Info
            NODE_ENV: process.env.NODE_ENV,
            NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
            VERCEL_ENV: process.env.VERCEL_ENV,
            VERCEL_URL: process.env.VERCEL_URL,

            // Database Info (masked connection string)
            MONGODB_URI: process.env.MONGODB_URI
                ? `${process.env.MONGODB_URI.substring(0, 20)}...${process.env.MONGODB_URI.substring(process.env.MONGODB_URI.length - 20)}`
                : 'Not set',

            // External Services (show if set, don't expose values)
            RESEND_API_KEY: process.env.RESEND_API_KEY ? '✓ Set' : '✗ Not set',
            PAYSTACK_API_KEY: process.env.PAYSTACK_API_KEY ? '✓ Set' : '✗ Not set',
            JWT_SECRET: process.env.JWT_SECRET ? '✓ Set' : '✗ Not set',
            WEBHOOK_SECRET: process.env.WEBHOOK_SECRET ? '✓ Set' : '✗ Not set',
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Not set',
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Not set',
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'Not set',

            // URLs
            PAYSTACK_CALLBACK_URL_TEST: process.env.PAYSTACK_CALLBACK_URL_TEST,
            PAYSTACK_CALLBACK_URL_PROD: process.env.PAYSTACK_CALLBACK_URL_PROD,
            WEBHOOK_URL: process.env.WEBHOOK_URL,

            // Email
            ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        };

        return NextResponse.json({
            success: true,
            environment: envVars,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error("Error fetching environment variables:", error);
        return NextResponse.json(
            { error: "Failed to fetch environment variables" },
            { status: 500 }
        );
    }
}
