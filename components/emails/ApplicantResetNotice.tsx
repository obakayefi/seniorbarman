import * as React from 'react';

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
  <div style={{
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#000',
    color: '#fff',
    padding: '40px',
    borderRadius: '24px',
    maxWidth: '600px',
    margin: '0 auto',
    border: '1px solid #222'
  }}>
    <h1 style={{
      fontSize: '24px',
      fontWeight: '950',
      textTransform: 'uppercase',
      letterSpacing: '-0.05em',
      marginBottom: '20px',
      color: '#3b82f6'
    }}>Application Form Reset</h1>
    
    <p style={{ fontSize: '16px', color: '#888', lineHeight: '1.6' }}>
      Hello {userName},
    </p>
    
    <p style={{ fontSize: '16px', color: '#fff', lineHeight: '1.6' }}>
      The event organizer reviewed your application for <strong>{eventTitle}</strong> and has reset your form entries so that you can make corrections.
    </p>

    <div style={{
      backgroundColor: '#0c1a30',
      border: '1px solid #1e3a8a',
      padding: '20px',
      borderRadius: '16px',
      marginTop: '20px',
      marginBottom: '30px'
    }}>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Instructions from organizer</p>
      <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#93c5fd', fontWeight: '700' }}>{reason}</p>
    </div>

    <div style={{ textAlign: 'center' }}>
      <a 
        href="https://seniorbarman.com/u/applications" 
        style={{
          display: 'inline-block',
          backgroundColor: '#3b82f6',
          color: '#fff',
          fontWeight: '800',
          textDecoration: 'none',
          padding: '14px 32px',
          borderRadius: '12px',
          textTransform: 'uppercase',
          fontSize: '12px',
          letterSpacing: '0.05em',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
        }}
      >
        Correct Application Form
      </a>
    </div>

    <p style={{ fontSize: '12px', color: '#444', marginTop: '40px', textAlign: 'center', borderTop: '1px solid #111', paddingTop: '20px' }}>
      Note: Your payment remains fully active and credited. You will not be charged again to complete this application.
    </p>
  </div>
);
