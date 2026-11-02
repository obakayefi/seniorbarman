import * as React from 'react';
import { EmailLayout, emailStyles } from './EmailLayout';

interface ApplicantResetNoticeProps {
  userName: string;
  eventTitle: string;
  reason: string;
}

export const ApplicantResetNotice: React.FC<Readonly<ApplicantResetNoticeProps>> = ({
  userName,
  eventTitle,
  reason,
}) => (
  <EmailLayout title="Application form needs an update" preheader={`Update your ${eventTitle} application`}>
    <p style={emailStyles.paragraph}>Hello {userName}, the organizer reset your application for <strong>{eventTitle}</strong> so you can make corrections.</p>
    <div style={emailStyles.panel}>
      <p style={emailStyles.label}>Instructions from the organizer</p>
      <p style={{ margin: '6px 0 0', fontSize: 14, color: '#3f3f46' }}>{reason}</p>
    </div>
    <p style={emailStyles.paragraph}>Your payment remains active. You will not be charged again to complete this application.</p>
    <p style={{ margin: '16px 0 0' }}><a href="https://seniorbarman.com/u/applications" style={emailStyles.button}>Update application</a></p>
  </EmailLayout>
);
