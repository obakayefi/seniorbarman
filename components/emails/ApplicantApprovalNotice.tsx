import * as React from 'react';

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
  <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
    <h1 style={{ color: '#10b981' }}>Application Accepted!</h1>
    <p>Hi {userName},</p>
    <p>
      Congratulations! Your application for <strong>{eventTitle}</strong> has been accepted by the organizer.
    </p>
    <div style={{ background: '#000', color: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'center', margin: '20px 0' }}>
      <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{eventTitle}</h2>
      <p style={{ margin: '5px 0', opacity: 0.8 }}>{venue}</p>
      <p style={{ margin: '5px 0', opacity: 0.8 }}>{date}</p>
      <div style={{ background: '#fff', padding: '15px', display: 'inline-block', borderRadius: '15px', marginTop: '20px' }}>
        <img src={qrCodeUrl} alt="Your Entry Ticket" style={{ width: '200px', height: '200px' }} />
      </div>
      <p style={{ marginTop: '15px', fontSize: '14px', opacity: 0.7 }}>Present this QR code at the entrance.</p>
    </div>
    <p>Enjoy the event!</p>
    <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
    <p style={{ fontSize: '12px', color: '#999' }}>Sent via Senior Barman Platform</p>
  </div>
);
