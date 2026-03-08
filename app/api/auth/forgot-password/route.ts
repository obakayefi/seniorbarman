import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import { resend } from "@/lib/resend";
import ResetPasswordEmail from "@/emails/ResetPasswordEmail";
import { getBaseUrl } from "@/lib/utils";

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

        // Create HTML email template
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #09090b; color: #ffffff;">
    <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; overflow: hidden; width: 100%;">
        <!-- Header -->
        <tr>
            <td style="padding: 32px 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff;">Senior<span style="color: #ea580c;">Barman</span></h1>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 32px 24px;">
                <h2 style="font-size: 24px; font-weight: bold; color: #ffffff; margin: 0 0 16px 0;">Reset Your Password</h2>
                <p style="font-size: 16px; color: #a1a1aa; margin: 0 0 24px 0;">
                    Hello ${user.firstName},<br><br>
                    Someone requested a password reset for your SeniorBarman account. If this was you, you can set a new password by clicking the button below:
                </p>

                <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetLink}" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">Reset Password</a>
                </div>

                <p style="font-size: 14px; color: #a1a1aa; margin: 0;">
                    If you did not request this, please ignore this email. This link will expire in 1 hour.
                </p>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="padding: 24px; text-align: center; border-top: 1px solid #27272a;">
                <p style="font-size: 14px; color: #52525b; margin: 8px 0;">
                    SeniorBarman Ticketing Platform. Ensuring secure and premium events.
                </p>
                <p style="font-size: 12px; color: #52525b; margin: 8px 0;">
                    © SeniorBarman 2024. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        // Send email
        const { data, error } = await resend.emails.send({
            from: "SeniorBarman <noreply@seniorbarman.com>",
            to: [email],
            subject: "Reset Your Password - SeniorBarman",
            html: emailHtml,
        });

        if (error) {
            console.error("Resend Error details:", error);
            return NextResponse.json({ error: "Failed to send reset email", details: error }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Reset email sent successfully",
        });

    } catch (error: any) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}
