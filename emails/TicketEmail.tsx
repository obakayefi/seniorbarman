import * as React from 'react';
import { getBaseUrl } from '@/lib/utils';

interface TicketEmailProps {
    ticketId: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventVenue: string;
    ticketType: string;
    qrCodeUrl: string;
    senderName?: string;
}

export const TicketEmail = ({
    ticketId,
    eventTitle,
    eventDate,
    eventTime,
    eventVenue,
    ticketType,
    qrCodeUrl,
    senderName = 'A friend',
}: TicketEmailProps) => (
    <html>
        <head>
            <style>{`
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 0;
                }
                .container {
                    background-color: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                    padding: 32px 24px;
                    text-align: center;
                    border-bottom: 4px solid #ea580c;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    color: #ffffff;
                    margin: 0;
                }
                .content {
                    padding: 32px 24px;
                }
                .title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #18181b;
                    margin: 0 0 16px 0;
                }
                .message {
                    font-size: 16px;
                    color: #52525b;
                    margin: 0 0 24px 0;
                }
                .ticket-card {
                    background-color: #fafafa;
                    border: 2px solid #e4e4e7;
                    border-radius: 12px;
                    padding: 24px;
                    margin: 24px 0;
                }
                .event-title {
                    font-size: 20px;
                    font-weight: bold;
                    color: #18181b;
                    margin: 0 0 16px 0;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid #e4e4e7;
                }
                .detail-row:last-child {
                    border-bottom: none;
                }
                .detail-label {
                    font-weight: 600;
                    color: #71717a;
                    font-size: 14px;
                    text-transform: uppercase;
                }
                .detail-value {
                    color: #18181b;
                    font-weight: 500;
                }
                .qr-section {
                    text-align: center;
                    padding: 24px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    margin: 24px 0;
                }
                .qr-code {
                    max-width: 200px;
                    margin: 0 auto;
                }
                .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                    color: #ffffff;
                    text-decoration: none;
                    padding: 14px 32px;
                    border-radius: 8px;
                    font-weight: 600;
                    text-align: center;
                    margin: 24px 0;
                }
                .footer {
                    background-color: #fafafa;
                    padding: 24px;
                    text-align: center;
                    border-top: 1px solid #e5e7eb;
                }
                .footer-text {
                    font-size: 14px;
                    color: #71717a;
                    margin: 8px 0;
                }
                .footer-links {
                    margin-top: 16px;
                }
                .footer-link {
                    color: #f97316;
                    text-decoration: none;
                    margin: 0 12px;
                    font-size: 14px;
                }
                .warning {
                    background-color: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 16px;
                    margin: 24px 0;
                    border-radius: 4px;
                }
                .warning-text {
                    color: #92400e;
                    font-size: 14px;
                    margin: 0;
                }
            `}</style>
        </head>
        <body>
            <div className="container">
                {/* Header */}
                <div className="header">
                    <h1 className="logo">🎟️ SeniorBarman</h1>
                </div>

                {/* Content */}
                <div className="content">
                    <h2 className="title">Your Event Ticket Has Arrived! 🎉</h2>
                    <p className="message">
                        {senderName} has shared an event ticket with you. Get ready for an amazing experience!
                    </p>

                    {/* Ticket Card */}
                    <div className="ticket-card">
                        <h3 className="event-title">{eventTitle}</h3>

                        <div className="detail-row">
                            <span className="detail-label">Date</span>
                            <span className="detail-value">{eventDate}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Time</span>
                            <span className="detail-value">{eventTime}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Venue</span>
                            <span className="detail-value">{eventVenue}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Ticket Type</span>
                            <span className="detail-value">{ticketType}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Ticket ID</span>
                            <span className="detail-value">#{ticketId}</span>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="qr-section">
                        <img src={qrCodeUrl} alt="Ticket QR Code" className="qr-code" />
                        <p style={{ marginTop: '16px', fontSize: '14px', color: '#71717a' }}>
                            Present this QR code at the venue entrance
                        </p>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <a href={`${getBaseUrl()}/tickets/p/${ticketId}`} className="button">
                            View Full Ticket
                        </a>
                    </div>

                    {/* Warning */}
                    <div className="warning">
                        <p className="warning-text">
                            ⚠️ <strong>Important:</strong> Do not share this QR code with anyone else. Each ticket can only be used once for entry.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="footer">
                    <p className="footer-text">
                        Having trouble with your ticket? <a href="mailto:support@seniorbarman.com" style={{ color: '#f97316' }}>Contact us</a>
                    </p>
                    <p className="footer-text">
                        Best,<br />
                        ~ SeniorBarman Team
                    </p>
                    {/* <div className="footer-links">
                        <a href="https://seniorbarman.com/help" className="footer-link">Help</a>
                        <a href="https://seniorbarman.com/terms" className="footer-link">Terms & conditions</a>
                        <a href="https://seniorbarman.com/privacy" className="footer-link">Privacy Policy</a>
                    </div> */}
                    <p className="footer-text" style={{ marginTop: '16px', fontSize: '12px' }}>
                        © SeniorBarman 2024. All rights reserved.<br />
                        Enugu State, Nigeria
                    </p>
                </div>
            </div>
        </body>
    </html>
);
