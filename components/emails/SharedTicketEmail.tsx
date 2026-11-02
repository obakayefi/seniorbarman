import * as React from 'react';
import { EmailLayout, emailStyles } from './EmailLayout';

interface SharedTicketEmailProps {
    ticketId: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventVenue: string;
    ticketType: string;
    qrCodeUrl: string;
    ticketUrl: string;
    senderName?: string;
}

export function SharedTicketEmail({ ticketId, eventTitle, eventDate, eventTime, eventVenue, ticketType, qrCodeUrl, ticketUrl, senderName = 'A friend' }: SharedTicketEmailProps) {
    const rows = [['Date', eventDate], ['Time', eventTime], ['Venue', eventVenue], ['Ticket type', ticketType], ['Ticket ID', `#${ticketId.substring(0, 8)}`]];
    return (
        <EmailLayout title="Your event ticket" preheader={`${eventTitle} ticket shared by ${senderName}`}>
            <p style={emailStyles.paragraph}>{senderName} shared a ticket with you for <strong>{eventTitle}</strong>.</p>
            <div style={emailStyles.panel}>
                <p style={{ margin: '0 0 8px', color: '#18181b', fontWeight: 700 }}>{eventTitle}</p>
                <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                    <tbody>{rows.map(([label, value]) => <tr key={label}>
                        <td style={{ padding: '5px 8px 5px 0', color: '#71717a', fontSize: 12 }}>{label}</td>
                        <td style={{ padding: '5px 0', textAlign: 'right', color: '#3f3f46', fontSize: 12, fontWeight: 600 }}>{value}</td>
                    </tr>)}</tbody>
                </table>
            </div>
            <div style={{ margin: '14px 0', textAlign: 'center' }}>
                {/* Email clients require a direct image URL for QR display. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt="Ticket QR code" width="150" height="150" style={{ display: 'inline-block', width: 150, height: 150 }} />
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#71717a' }}>Show this code at the venue. Each ticket is valid for one entry.</p>
            </div>
            <p style={{ margin: '16px 0 0' }}><a href={ticketUrl} style={emailStyles.button}>View ticket</a></p>
        </EmailLayout>
    );
}
