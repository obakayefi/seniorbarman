import * as React from 'react';
import { EmailLayout, emailStyles } from './EmailLayout';

interface ApplicantApprovalNoticeProps {
  userName: string;
  eventTitle: string;
  venue: string;
  date: string;
  qrCodeUrl: string;
}

export const ApplicantApprovalNotice: React.FC<Readonly<ApplicantApprovalNoticeProps>> = ({
  userName,
  eventTitle,
  venue,
  date,
  qrCodeUrl,
}) => (
  <EmailLayout title="Your application is approved" preheader={`${eventTitle} application approved`}>
    <p style={emailStyles.paragraph}>Hi {userName}, your application for <strong>{eventTitle}</strong> has been approved.</p>
    <div style={emailStyles.panel}>
      <p style={{ margin: '0 0 4px', color: '#18181b', fontWeight: 700 }}>{eventTitle}</p>
      <p style={{ margin: 0, fontSize: 13, color: '#52525b' }}>{venue} · {date}</p>
    </div>
    <div style={{ margin: '14px 0', textAlign: 'center' }}>
      {/* Email clients require a direct image URL for QR display. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrCodeUrl} alt="Your entry QR code" width="160" height="160" style={{ display: 'inline-block', width: 160, height: 160 }} />
      <p style={{ margin: '6px 0 0', fontSize: 12, color: '#71717a' }}>Show this QR code at the entrance.</p>
    </div>
  </EmailLayout>
);
