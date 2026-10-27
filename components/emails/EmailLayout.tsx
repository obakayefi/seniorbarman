import * as React from 'react';

interface EmailLayoutProps {
    title: string;
    preheader?: string;
    children: React.ReactNode;
}

export function EmailLayout({ title, preheader, children }: EmailLayoutProps) {
    return (
        <html>
            {/* Email clients need a viewport declaration in the document head. */}
            {/* eslint-disable-next-line @next/next/no-head-element */}
            <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
            <body style={{ margin: 0, padding: '24px 12px', backgroundColor: '#f4f4f5', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', color: '#27272a' }}>
                {preheader && <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden', opacity: 0, color: 'transparent' }}>{preheader}</div>}
                <table role="presentation" cellPadding={0} cellSpacing={0} width="100%" style={{ maxWidth: 560, margin: '0 auto', backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: 10, overflow: 'hidden' }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: '18px 24px', borderBottom: '3px solid #ea580c' }}>
                                <p style={{ margin: 0, color: '#18181b', fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' }}>Senior<span style={{ color: '#ea580c' }}>Barman</span></p>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: '24px 24px 20px' }}>
                                <h1 style={{ margin: '0 0 14px', fontSize: 21, lineHeight: 1.3, fontWeight: 700, letterSpacing: '-0.4px', color: '#18181b' }}>{title}</h1>
                                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#52525b' }}>{children}</div>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: '14px 24px', borderTop: '1px solid #e4e4e7', backgroundColor: '#fafafa' }}>
                                <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: '#71717a' }}>Senior Barman · Events and ticketing across Nigeria</p>
                                <p style={{ margin: '4px 0 0', fontSize: 11, lineHeight: 1.5, color: '#a1a1aa' }}>This is an automated message. For help, contact <a href="mailto:admin@seniorbarman.com" style={{ color: '#c2410c', textDecoration: 'none' }}>admin@seniorbarman.com</a>.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </body>
        </html>
    );
}

export const emailStyles = {
    paragraph: { margin: '0 0 12px', fontSize: 14, lineHeight: 1.6, color: '#52525b' } as React.CSSProperties,
    panel: { margin: '14px 0', padding: '14px 16px', border: '1px solid #e4e4e7', borderRadius: 8, backgroundColor: '#fafafa' } as React.CSSProperties,
    label: { margin: 0, color: '#71717a', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em' },
    button: { display: 'inline-block', padding: '10px 16px', borderRadius: 6, backgroundColor: '#ea580c', color: '#ffffff', fontWeight: 600, fontSize: 13, textDecoration: 'none' } as React.CSSProperties,
};
