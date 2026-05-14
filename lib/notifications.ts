import { resend } from './resend';
import { render } from '@react-email/render';
import Notification from '@/models/Notification';
import { OrganizerPaymentAlert } from '@/components/emails/OrganizerPaymentAlert';
import { ApplicantApprovalNotice } from '@/components/emails/ApplicantApprovalNotice';
import { ApplicantRejectionNotice } from '@/components/emails/ApplicantRejectionNotice';
import React from 'react';

export async function createInAppNotification({
    userId,
    title,
    message,
    type = 'info',
    link
}: {
    userId: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    link?: string;
}) {
    try {
        await Notification.create({
            user: userId,
            title,
            message,
            type,
            link
        });
    } catch (error) {
        console.error("Failed to create in-app notification:", error);
    }
}

export async function notifyOrganizerOfPayment({
    organizerEmail,
    organizerName,
    organizerId,
    eventTitle,
    applicantName,
    amount
}: {
    organizerEmail: string;
    organizerName: string;
    organizerId: string;
    eventTitle: string;
    applicantName: string;
    amount: number;
}) {
    // 1. Send Email
    try {
        const emailHtml = await render(
            React.createElement(OrganizerPaymentAlert, {
                organizerName,
                eventTitle,
                applicantName,
                amount
            })
        );

        await resend.emails.send({
            from: 'Senior Barman <notifications@seniorbarman.com>',
            to: organizerEmail,
            subject: `New Application Payment: ${eventTitle}`,
            html: emailHtml,
        });
    } catch (error) {
        console.error("Email notification failed:", error);
    }

    // 2. In-App Notification
    await createInAppNotification({
        userId: organizerId,
        title: 'New Application Payment',
        message: `${applicantName} paid ₦${amount.toLocaleString()} for ${eventTitle}.`,
        type: 'success',
        link: '/u/organizer/events' // Should probably point to specific event applicants page
    });
}

export async function notifyApplicantOfApproval({
    userEmail,
    userName,
    userId,
    eventTitle,
    venue,
    date,
    qrCodeUrl
}: {
    userEmail: string;
    userName: string;
    userId: string;
    eventTitle: string;
    venue: string;
    date: string;
    qrCodeUrl: string;
}) {
    // 1. Send Email
    try {
        const emailHtml = await render(
            React.createElement(ApplicantApprovalNotice, {
                userName,
                eventTitle,
                venue,
                date,
                qrCodeUrl
            })
        );

        await resend.emails.send({
            from: 'Senior Barman <notifications@seniorbarman.com>',
            to: userEmail,
            subject: `Application Accepted: ${eventTitle}`,
            html: emailHtml,
        });
    } catch (error) {
        console.error("Email notification failed:", error);
    }

    // 2. In-App Notification
    await createInAppNotification({
        userId: userId,
        title: 'Application Accepted!',
        message: `Your application for ${eventTitle} has been accepted. Check your email for the QR code.`,
        type: 'success',
        link: '/u/attendee/tickets'
    });
}

export async function notifyApplicantOfRejection({
    userEmail,
    userName,
    userId,
    eventTitle,
    reason
}: {
    userEmail: string;
    userName: string;
    userId: string;
    eventTitle: string;
    reason: string;
}) {
    // 1. Send Email
    try {
        const emailHtml = await render(
            React.createElement(ApplicantRejectionNotice, {
                userName,
                eventTitle,
                reason
            })
        );

        await resend.emails.send({
            from: 'Senior Barman <notifications@seniorbarman.com>',
            to: userEmail,
            subject: `Application Update: ${eventTitle}`,
            html: emailHtml,
        });
    } catch (error) {
        console.error("Email notification failed:", error);
    }

    // 2. In-App Notification
    await createInAppNotification({
        userId: userId,
        title: 'Application Update',
        message: `Your application for ${eventTitle} was not approved. Reason: ${reason}`,
        type: 'error',
        link: `/events`
    });
}
