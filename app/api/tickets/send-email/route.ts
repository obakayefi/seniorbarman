import { NextRequest, NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { getBaseUrl } from '@/lib/utils';
import { render } from '@react-email/render';
import React from 'react';
import { SharedTicketEmail } from '@/components/emails/SharedTicketEmail';

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


        const sharedEmailHtml = await render(React.createElement(SharedTicketEmail, {
            ticketId,
            eventTitle,
            eventDate,
            eventTime,
            eventVenue,
            ticketType,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`,
            ticketUrl: `${getBaseUrl()}/tickets/p/${hashToken}`,
            senderName,
        }));

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: 'Senior Barman <notifications@seniorbarman.com>',
            to: recipientEmail,
            subject: `🎟️ Your Ticket for ${eventTitle}`,
            html: sharedEmailHtml,
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

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error('Email send error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: message },
            { status: 500 }
        );
    }
}
