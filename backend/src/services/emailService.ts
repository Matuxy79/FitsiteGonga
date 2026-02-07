type SendPasswordResetEmailParams = {
  to: string;
  resetUrl: string;
};

type EmailSendResult = {
  delivered: boolean;
};

function getFrontendUrl(): string {
  return process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || 'FitsiteGonga <onboarding@resend.dev>';
}

async function sendViaResend(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Resend error (${response.status}): ${body || response.statusText}`);
  }
}

export const emailService = {
  getFrontendUrl,

  async sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<EmailSendResult> {
    const subject = 'Reset your FitsiteGonga password';
    const html = `
      <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; line-height: 1.5;">
        <h2 style="margin: 0 0 12px 0;">Password reset</h2>
        <p style="margin: 0 0 12px 0;">A password reset was requested for your FitsiteGonga account.</p>
        <p style="margin: 0 0 12px 0;">
          <a href="${params.resetUrl}" style="display:inline-block;padding:10px 14px;border:1px solid #10b981;text-decoration:none;color:#10b981;">
            Set a new password
          </a>
        </p>
        <p style="margin: 0; color: #6b7280;">If you did not request this, you can ignore this email.</p>
      </div>
    `;

    const hasResend = Boolean(process.env.RESEND_API_KEY);
    if (!hasResend) {
      console.log(`[password-reset] No email provider configured. Reset link for ${params.to}: ${params.resetUrl}`);
      return { delivered: false };
    }

    await sendViaResend({ to: params.to, subject, html });
    return { delivered: true };
  },
};

