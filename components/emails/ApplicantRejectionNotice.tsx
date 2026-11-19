import * as React from 'react';
import { EmailLayout, emailStyles } from './EmailLayout';

interface ApplicantRejectionNoticeProps {
  userName: string;
  eventTitle: string;
  reason: string;
}

export const ApplicantRejectionNotice: React.FC<Readonly<ApplicantRejectionNoticeProps>> = ({
  userName,
  eventTitle,
  reason,
}) => (
  <EmailLayout title="Application update" preheader={`An update about your ${eventTitle} application`}>
    <p style={emailStyles.paragraph}>Hello {userName}, the organizer has decided not to move forward with your application for <strong>{eventTitle}</strong>.</p>
    <div style={emailStyles.panel}>
      <p style={emailStyles.label}>Reason</p>
      <p style={{ margin: '6px 0 0', fontSize: 14, color: '#3f3f46' }}>{reason}</p>
    </div>
    <p style={{ ...emailStyles.paragraph, marginBottom: 0 }}>You can still apply for future activities on Senior Barman.</p>
  </EmailLayout>
);
