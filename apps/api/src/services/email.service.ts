import nodemailer from 'nodemailer';
import { logger } from '../lib/logger';

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

interface InvitationEmailOptions {
  to: string;
  inviterName: string;
  roomName: string;
  inviteUrl: string;
  expiresAt: Date;
}

export async function sendInvitationEmail(opts: InvitationEmailOptions): Promise<void> {
  const { to, inviterName, roomName, inviteUrl, expiresAt } = opts;

  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to ${roomName}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111118;border:1px solid #1e1e2e;border-radius:16px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed22,#3b82f622);padding:32px;text-align:center;border-bottom:1px solid #1e1e2e;">
            <div style="width:48px;height:48px;background:#7c3aed33;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
              <span style="font-size:24px;">📹</span>
            </div>
            <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 8px;">You're invited!</h1>
            <p style="color:#888;margin:0;font-size:14px;">
              <strong style="color:#a78bfa">${inviterName}</strong> invited you to join a video meeting
            </p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;text-align:center;">
            <p style="color:#ccc;font-size:16px;margin:0 0 8px;">Room</p>
            <h2 style="color:#fff;font-size:28px;font-weight:700;margin:0 0 32px;">${roomName}</h2>
            <a href="${inviteUrl}"
               style="display:inline-block;background:#7c3aed;color:#fff;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;text-decoration:none;">
              Accept &amp; Join Room →
            </a>
            <p style="color:#555;font-size:12px;margin:24px 0 0;">
              This invitation expires on ${expiresAt.toLocaleDateString('en-US', { dateStyle: 'long' })}.
            </p>
            <p style="color:#333;font-size:12px;margin:8px 0 0;">
              Or copy this link: <a href="${inviteUrl}" style="color:#7c3aed;">${inviteUrl}</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #1e1e2e;padding:20px;text-align:center;">
            <p style="color:#444;font-size:12px;margin:0;">
              Sent by SucMeet · If you didn't expect this, you can safely ignore it.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();

  try {
    await transporter.sendMail({
      from: `"SucMeet" <${process.env.EMAIL_FROM || 'noreply@sucmeet.com'}>`,
      to,
      subject: `${inviterName} invited you to "${roomName}" on SucMeet`,
      html,
    });
    logger.info(`Invitation email sent to ${to}`);
  } catch (err) {
    logger.error(`Failed to send invitation email to ${to}:`, err);
    throw err;
  }
}
