import * as React from 'react';

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
  <div style={{
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#000',
    color: '#fff',
    padding: '40px',
    borderRadius: '24px',
    maxWidth: '600px',
    margin: '0 auto',
  }}>
    <h1 style={{
      fontSize: '24px',
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '-0.05em',
      marginBottom: '20px',
    }}>Application Update</h1>
    
    <p style={{ fontSize: '16px', color: '#888', lineHeight: '1.6' }}>
      Hello {userName},
    </p>
    
    <p style={{ fontSize: '16px', color: '#fff', lineHeight: '1.6' }}>
      Thank you for your interest in <strong>{eventTitle}</strong>. After careful review, the organizer has decided not to move forward with your application at this time.
    </p>

    <div style={{
      backgroundColor: '#111',
      border: '1px solid #333',
      padding: '20px',
      borderRadius: '16px',
      marginTop: '20px',
    }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', color: '#555', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Reason for decision</p>
      <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#ff4d4d', fontWeight: '700' }}>{reason}</p>
    </div>

    <p style={{ fontSize: '14px', color: '#555', marginTop: '40px', textAlign: 'center' }}>
      This decision is final for this specific event. Feel free to apply for future activities on SeniorBarman.
    </p>
  </div>
);
