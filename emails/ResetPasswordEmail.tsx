import * as React from 'react';

interface ResetPasswordEmailProps {
    userFirstName?: string;
    resetPasswordLink?: string;
}

export const ResetPasswordEmail = ({
    userFirstName = 'there',
    resetPasswordLink = '#',
}: ResetPasswordEmailProps) => (
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
                    background-color: #f9fafb;
                }
                .container {
                    background-color: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                    margin: 40px auto;
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
                .action-card {
                    background-color: #fafafa;
                    border: 2px solid #e4e4e7;
                    border-radius: 12px;
                    padding: 24px;
                    margin: 24px 0;
                    text-align: center;
                }
                .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
                    color: #ffffff;
                    text-decoration: none;
                    padding: 14px 32px;
                    border-radius: 8px;
                    font-weight: 600;
                    text-align: center;
                    margin: 16px 0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
                .warning {
                    background-color: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 16px;
                    margin: 24px 0;
                    border-radius: 4px;
                    text-align: left;
                }
                .warning-text {
                    color: #92400e;
                    font-size: 13px;
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
                    <h2 className="title">Reset Your Password</h2>
                    <p className="message">
                        Hello {userFirstName},<br />
                        We received a request to reset the password for your SeniorBarman account. No worries, it happens to the best of us!
                    </p>

                    {/* Action Card */}
                    <div className="action-card">
                        <p style={{ margin: '0 0 16px 0', fontWeight: '500', color: '#18181b' }}>
                            Click the button below to choose a new password:
                        </p>
                        <a href={resetPasswordLink} className="button">
                            Create New Password
                        </a>
                        <p style={{ marginTop: '16px', fontSize: '13px', color: '#71717a' }}>
                            This link will expire in 1 hour for security reasons.
                        </p>
                    </div>

                    {/* Warning/Info */}
                    <div className="warning">
                        <p className="warning-text">
                            <strong>Didn&apos;t request this?</strong> If you didn&apos;t ask for a password reset, you can safely ignore this email. Your password will remain unchanged.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="footer">
                    <p className="footer-text">
                        Enabling premium event experiences across Nigeria.
                    </p>
                    <p className="footer-text">
                        Best,<br />
                        ~ SeniorBarman Team
                    </p>
                    <p className="footer-text" style={{ marginTop: '16px', fontSize: '12px' }}>
                        © SeniorBarman 2024. All rights reserved.<br />
                        Enugu State, Nigeria
                    </p>
                </div>
            </div>
        </body>
    </html>
);

export default ResetPasswordEmail;
