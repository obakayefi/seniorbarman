import * as React from 'react';

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
  <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
    <h1 style={{ color: '#f97316' }}>New Application Payment!</h1>
    <p>Hi {organizerName},</p>
    <p>
      An applicant (<strong>{applicantName}</strong>) has just paid the application fee for your event 
      <strong> {eventTitle}</strong>.
    </p>
    <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
      <p style={{ margin: 0 }}><strong>Amount Paid:</strong> ₦{amount.toLocaleString()}</p>
    </div>
    <p>You can now review their application in your dashboard.</p>
    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
    <p style={{ fontSize: '12px', color: '#999' }}>Sent via Senior Barman Platform</p>
  </div>
);
