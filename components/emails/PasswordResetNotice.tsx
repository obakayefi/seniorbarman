import * as React from 'react';
import { EmailLayout, emailStyles } from './EmailLayout';

export function PasswordResetNotice({ name, resetLink }: { name: string; resetLink: string }) {
    return (
        <EmailLayout title="Reset your password" preheader="A link to reset your Senior Barman password">
            <p style={emailStyles.paragraph}>Hello {name}, we received a request to reset your Senior Barman password.</p>
            <p style={{ margin: '16px 0' }}><a href={resetLink} style={emailStyles.button}>Reset password</a></p>
            <p style={{ ...emailStyles.paragraph, marginBottom: 0 }}>This link expires in one hour. If you did not request a reset, you can ignore this email.</p>
        </EmailLayout>
    );
}
