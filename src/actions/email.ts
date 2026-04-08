'use server';

import { resend } from '@/lib/resend';

type SendEmailState = {
    success: boolean;
    error?: string;
    data?: any;
};

export async function sendEmail(
    to: string,
    subject: string,
    html: string
): Promise<SendEmailState> {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'; // Default or provided env var

    try {
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Server Action Error:', error);
        return { success: false, error: 'Failed to send email.' };
    }
}
