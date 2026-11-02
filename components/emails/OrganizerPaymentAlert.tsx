import * as React from 'react';
import { EmailLayout, emailStyles } from './EmailLayout';

interface OrganizerPaymentAlertProps {
  organizerName: string;
  eventTitle: string;
  applicantName: string;
  amount: number;
}

export const OrganizerPaymentAlert: React.FC<Readonly<OrganizerPaymentAlertProps>> = ({
  organizerName,
  eventTitle,
  applicantName,
  amount,
}) => (
  <EmailLayout title="Application payment received" preheader={`${applicantName} paid for ${eventTitle}`}>
    <p style={emailStyles.paragraph}>Hi {organizerName}, <strong>{applicantName}</strong> paid the application fee for <strong>{eventTitle}</strong>.</p>
    <div style={emailStyles.panel}>
      <p style={emailStyles.label}>Amount received</p>
      <p style={{ margin: '5px 0 0', fontSize: 18, fontWeight: 700, color: '#18181b' }}>₦{amount.toLocaleString('en-NG')}</p>
    </div>
    <p style={{ ...emailStyles.paragraph, marginBottom: 0 }}>You can now review the application in your dashboard.</p>
  </EmailLayout>
);
