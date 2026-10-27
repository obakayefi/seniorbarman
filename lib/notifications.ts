import { resend } from './resend';
import { render } from '@react-email/render';
import Notification from '@/models/Notification';
import { OrganizerPaymentAlert } from '@/components/emails/OrganizerPaymentAlert';
import { ApplicantApprovalNotice } from '@/components/emails/ApplicantApprovalNotice';
import { ApplicantRejectionNotice } from '@/components/emails/ApplicantRejectionNotice';
import { ApplicantResetNotice } from '@/components/emails/ApplicantResetNotice';
import React from 'react';
import { getBaseUrl } from '@/lib/utils';
import Setting from '@/models/Setting';
import { connectDB } from '@/lib/mongodb';
import { EmailLayout, emailStyles } from '@/components/emails/EmailLayout';

async function renderStandardEmail(title: string, children: React.ReactNode) {
    return render(React.createElement(EmailLayout, { title }, children));
}

async function getAdminNotificationRecipients(key: string) {
    try {
        await connectDB();
        const setting = await Setting.findOne({ key }).lean();
        const configured = typeof setting?.value === 'string' ? setting.value : '';
        const addresses = configured.split(/[;,\n]/).map((email: string) => email.trim()).filter(Boolean);
        if (addresses.length) return addresses;
    } catch (error) {
        console.error(`Unable to load ${key} notification recipients:`, error);
    }
    return process.env.ADMIN_EMAIL?.split(/[;,\n]/).map(email => email.trim()).filter(Boolean) || [];
}

export async function notifyAdminOfProviderRequest({
    name, email, role, organizationName, teamName
}: {
    name: string;
    email: string;
    role: string;
    organizationName?: string;
    teamName?: string;
}) {
    const recipients = await getAdminNotificationRecipients('notification_email_provider_requests');
    if (!recipients.length) {
        console.error('Provider request notification skipped: no notification recipient is configured.');
        return false;
    }

    const reviewUrl = `${getBaseUrl()}/u/a/provider-requests?status=pending`;

    try {
        const emailHtml = await renderStandardEmail('Provider request received', React.createElement(React.Fragment, null,
            React.createElement('p', { style: emailStyles.paragraph }, 'A new provider request is ready for review.'),
            React.createElement('div', { style: emailStyles.panel },
                React.createElement('p', { style: emailStyles.paragraph }, React.createElement('strong', null, 'Applicant: '), name),
                React.createElement('p', { style: emailStyles.paragraph }, React.createElement('strong', null, 'Email: '), email),
                React.createElement('p', { style: emailStyles.paragraph }, React.createElement('strong', null, 'Requested role: '), role.replace('_', ' ')),
                organizationName ? React.createElement('p', { style: emailStyles.paragraph }, React.createElement('strong', null, 'Organization: '), organizationName) : null,
                teamName ? React.createElement('p', { style: { ...emailStyles.paragraph, marginBottom: 0 } }, React.createElement('strong', null, 'Team: '), teamName) : null
            ),
            React.createElement('p', { style: { margin: '16px 0 0' } }, React.createElement('a', { href: reviewUrl, style: emailStyles.button }, 'Review request'))
        ));
        const { error } = await resend.emails.send({
            from: 'Senior Barman <notifications@seniorbarman.com>',
            to: recipients,
            subject: `New ${role.replace('_', ' ')} provider request`,
            html: emailHtml,
        });
        if (error) {
            console.error('Provider request email failed:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Provider request email failed:', error);
        return false;
    }
}

export async function notifyUserOfProviderRequestApproval({ userEmail, userName, role }: {
    userEmail: string;
    userName: string;
    role: string;
}) {
    try {
        const emailHtml = await renderStandardEmail('Your provider request was approved', React.createElement(React.Fragment, null,
            React.createElement('p', { style: emailStyles.paragraph }, `Hi ${userName}, your request to join Senior Barman as a ${role.replace('_', ' ')} has been approved.`),
            React.createElement('p', { style: emailStyles.paragraph }, 'Your account now has access to the tools for your provider role.'),
            React.createElement('p', { style: { margin: '16px 0 0' } }, React.createElement('a', { href: `${getBaseUrl()}/auth/login`, style: emailStyles.button }, 'Sign in to your account'))
        ));
        const { error } = await resend.emails.send({
            from: 'Senior Barman <notifications@seniorbarman.com>',
            to: userEmail,
            subject: 'Your Senior Barman provider request was approved',
            html: emailHtml,
        });
        if (error) {
            console.error('Provider approval email failed:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Provider approval email failed:', error);
        return false;
    }
}

export async function notifyAdminOfPayoutRequest({
    organizerName, organizerEmail, eventTitle, grossRevenue, commission, payoutAmount, payoutDetails
}: {
    organizerName: string;
    organizerEmail: string;
    eventTitle: string;
    grossRevenue: number;
    commission: number;
    payoutAmount: number;
    payoutDetails: string;
}) {
    const recipients = await getAdminNotificationRecipients('notification_email_payout_requests');
    if (!recipients.length) {
        console.error('Payout request notification skipped: no notification recipient is configured.');
        return false;
    }
    const reviewUrl = `${getBaseUrl()}/u/a/payout-requests`;
    try {
        const emailHtml = await renderStandardEmail('Organizer payout request', React.createElement(React.Fragment, null,
            React.createElement('p', { style: emailStyles.paragraph }, 'A payout request is ready for review.'),
            React.createElement('div', { style: emailStyles.panel },
                React.createElement('p', { style: emailStyles.paragraph }, React.createElement('strong', null, 'Organizer: '), `${organizerName} (${organizerEmail})`),
                React.createElement('p', { style: emailStyles.paragraph }, React.createElement('strong', null, 'Event: '), eventTitle),
                React.createElement('p', { style: emailStyles.paragraph }, React.createElement('strong', null, 'Gross collected: '), `₦${grossRevenue.toLocaleString('en-NG')}`),
                React.createElement('p', { style: emailStyles.paragraph }, React.createElement('strong', null, 'Platform commission (20%): '), `₦${commission.toLocaleString('en-NG')}`),
                React.createElement('p', { style: emailStyles.paragraph }, React.createElement('strong', null, 'Organizer balance: '), `₦${payoutAmount.toLocaleString('en-NG')}`),
                React.createElement('p', { style: { ...emailStyles.paragraph, marginBottom: 0 } }, React.createElement('strong', null, 'Payment instructions: '), payoutDetails)
            ),
            React.createElement('p', { style: { margin: '16px 0 0' } }, React.createElement('a', { href: reviewUrl, style: emailStyles.button }, 'Review payout request'))
        ));
        const { error } = await resend.emails.send({
            from: 'Senior Barman <notifications@seniorbarman.com>',
            to: recipients,
            subject: `Payout requested: ${eventTitle}`,
            html: emailHtml,
        });
        if (error) {
            console.error('Payout request email failed:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Payout request email failed:', error);
        return false;
    }
}

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

export async function notifyApplicantOfReset({
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
            React.createElement(ApplicantResetNotice, {
                userName,
                eventTitle,
                reason
            })
        );

        await resend.emails.send({
            from: 'Senior Barman <notifications@seniorbarman.com>',
            to: userEmail,
            subject: `Application Reset Request: ${eventTitle}`,
            html: emailHtml,
        });
    } catch (error) {
        console.error("Email notification failed:", error);
    }

    // 2. In-App Notification
    await createInAppNotification({
        userId: userId,
        title: 'Application Form Reset',
        message: `Your application form for ${eventTitle} was reset by the organizer. Reason: ${reason}`,
        type: 'warning',
        link: `/u/applications`
    });
}
