import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import { resend } from "@/lib/resend";
import { getBaseUrl } from "@/lib/utils";
import { render } from "@react-email/render";
import React from "react";
import { PasswordResetNotice } from "@/components/emails/PasswordResetNotice";

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await User.findOne({ email });

        if (!user) {
            // We return success even if user not found for security reasons (prevent email enumeration)
            // But for this project's requirements, we might want to be explicit.
            // Let's go with explicit for better UX as it's a private/controlled environment.
            return NextResponse.json({ error: "No account found with that email" }, { status: 404 });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        const resetLink = `${getBaseUrl()}/auth/reset-password/${resetToken}`;


        const sharedEmailHtml = await render(React.createElement(PasswordResetNotice, {
            name: user.firstName || 'there',
            resetLink,
        }));

        // Send email
        const { error } = await resend.emails.send({
            from: "Senior Barman <notifications@seniorbarman.com>",
            to: [email],
            subject: "Reset Your Password - SeniorBarman",
            html: sharedEmailHtml,
        });

        if (error) {
            console.error("Resend Error details:", error);
            return NextResponse.json({ error: "Failed to send reset email", details: error }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Reset email sent successfully",
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Forgot Password Error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: message },
            { status: 500 }
        );
    }
}
