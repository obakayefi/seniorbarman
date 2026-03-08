import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { getBaseUrl } from '@/lib/utils';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            recipientEmail,
            ticketId,
            eventTitle,
            eventDate,
            eventTime,
            eventVenue,
            ticketType,
            qrCodeUrl,
            senderName,
            hashToken
        } = body;

        // Validation
        if (!recipientEmail || !ticketId || !eventTitle) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(recipientEmail)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Create HTML email template
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Event Ticket</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; width: 100%;">
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 32px 24px; text-align: center; border-bottom: 4px solid #ea580c;">
                <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff;">🎟️ SeniorBarman</h1>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 32px 24px;">
                <h2 style="font-size: 24px; font-weight: bold; color: #18181b; margin: 0 0 16px 0;">Your Event Ticket Has Arrived! 🎉</h2>
                <p style="font-size: 16px; color: #52525b; margin: 0 0 24px 0;">
                    ${senderName || 'A friend'} has shared an event ticket with you. Get ready for an amazing experience!
                </p>

                <!-- Ticket Card -->
                <div style="background-color: #fafafa; border: 2px solid #e4e4e7; border-radius: 12px; padding: 24px; margin: 24px 0;">
                    <h3 style="font-size: 20px; font-weight: bold; color: #18181b; margin: 0 0 16px 0;">${eventTitle}</h3>
                    
                    <table style="width: 100%;">
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">
                                <span style="font-weight: 600; color: #71717a; font-size: 14px; text-transform: uppercase;">Date</span>
                            </td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; text-align: right;">
                                <span style="color: #18181b; font-weight: 500;">${eventDate}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">
                                <span style="font-weight: 600; color: #71717a; font-size: 14px; text-transform: uppercase;">Time</span>
                            </td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; text-align: right;">
                                <span style="color: #18181b; font-weight: 500;">${eventTime}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">
                                <span style="font-weight: 600; color: #71717a; font-size: 14px; text-transform: uppercase;">Venue</span>
                            </td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; text-align: right;">
                                <span style="color: #18181b; font-weight: 500;">${eventVenue}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">
                                <span style="font-weight: 600; color: #71717a; font-size: 14px; text-transform: uppercase;">Ticket Type</span>
                            </td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; text-align: right;">
                                <span style="color: #18181b; font-weight: 500;">${ticketType}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0;">
                                <span style="font-weight: 600; color: #71717a; font-size: 14px; text-transform: uppercase;">Ticket ID</span>
                            </td>
                            <td style="padding: 12px 0; text-align: right;">
                                <span style="color: #18181b; font-weight: 500;">#${ticketId.substring(0, 8)}</span>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- QR Code -->
                <div style="text-align: center; padding: 24px; background-color: #ffffff; border-radius: 8px; margin: 24px 0;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}" alt="Ticket QR Code" style="max-width: 200px; margin: 0 auto; display: block;" />
                    <p style="margin-top: 16px; font-size: 14px; color: #71717a;">Present this QR code at the venue entrance</p>
                </div>

                <div style="text-align: center; margin: 24px 0;">
                    <a href="${getBaseUrl()}/tickets/p/${hashToken}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">View Full Ticket</a>
                </div>

                <!-- Warning -->
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                    <p style="color: #92400e; font-size: 14px; margin: 0;">⚠️ <strong>Important:</strong> Do not share this QR code with anyone else. Each ticket can only be used once for entry.</p>
                </div>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background-color: #fafafa; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 14px; color: #71717a; margin: 8px 0;">
                    Having trouble with your ticket? <a href="mailto:support@seniorbarman.com" style="color: #f97316; text-decoration: none;">Contact us</a>
                </p>
                <p style="font-size: 14px; color: #71717a; margin: 8px 0;">
                    Best,<br />~ SeniorBarman Team
                </p>
                <div style="margin-top: 16px;">
                    <a href="${getBaseUrl()}/help" style="color: #f97316; text-decoration: none; margin: 0 12px; font-size: 14px;">Help</a>
                    <a href="${getBaseUrl()}/terms" style="color: #f97316; text-decoration: none; margin: 0 12px; font-size: 14px;">Terms</a>
                    <a href="${getBaseUrl()}/privacy" style="color: #f97316; text-decoration: none; margin: 0 12px; font-size: 14px;">Privacy</a>
                </div>
                <p style="font-size: 12px; color: #71717a; margin-top: 16px;">
                    © SeniorBarman 2024. All rights reserved.<br />Lagos State, Nigeria
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: 'SeniorBarman <onboarding@resend.dev>',
            to: recipientEmail,
            subject: `🎟️ Your Ticket for ${eventTitle}`,
            html: emailHtml,
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json(
                { error: 'Failed to send email', details: error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Ticket sent successfully',
            emailId: data?.id,
        });

    } catch (error: any) {
        console.error('Email send error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
