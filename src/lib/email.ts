import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const apiKey = process.env.SENDGRID_API_KEY;
  const smtpHost = process.env.EMAIL_HOST;
  const smtpUser = process.env.EMAIL_USER;
  const smtpPass = process.env.EMAIL_PASS;

  // Prefer SMTP if configured
  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    console.log("[EMAIL] Using SMTP transport");
    return transporter;
  }

  // Fall back to SendGrid if API key available
  if (apiKey && apiKey !== 'your-sendgrid-api-key-here') {
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: apiKey,
      },
    });
    console.log("[EMAIL] Using SendGrid transport");
    return transporter;
  }

  // No email transport configured - log what's missing
  const missing = [];
  if (!smtpHost) missing.push('EMAIL_HOST');
  if (!smtpUser) missing.push('EMAIL_USER');
  if (!smtpPass) missing.push('EMAIL_PASS');
  if (!apiKey || apiKey === 'your-sendgrid-api-key-here') missing.push('SENDGRID_API_KEY');
  
  console.log(`[EMAIL STUB] No email transport configured. Missing env vars: ${missing.join(', ')}. Add these to Vercel to enable email sending.`);
  console.log(`[EMAIL STUB] For SMTP: EMAIL_HOST, EMAIL_PORT (optional, default 587), EMAIL_USER, EMAIL_PASS, EMAIL_SECURE (optional), EMAIL_FROM (optional), EMAIL_FROM_NAME (optional)`);
  
  return null;
}

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const t = getTransporter();
    if (!t) {
      console.log(`[EMAIL STUB] Would send email to ${options.to}: ${options.subject}`);
      console.log(`[EMAIL STUB] Body: ${options.text}`);
      return false;
    }

    await t.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Sealed & Secured'}" <${process.env.EMAIL_FROM || 'noreply@ssproc.co.za'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text.replace(/\n/g, '<br/>'),
    });

    console.log(`[EMAIL] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send:', error);
    return false;
  }
}

export async function sendOtpEmail(to: string, name: string, otp: string): Promise<boolean> {
  return sendEmail({
    to,
    subject: 'Your Sealed & Secured verification code',
    text: `Hi ${name},

Your verification code is: ${otp}

This code expires in 15 minutes.

If you didn't request this code, please ignore this email.

Best regards,
Sealed & Secured Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f8f9fa; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="background: #0a1628; color: white; font-weight: bold; font-size: 20px; padding: 12px 24px; border-radius: 12px; display: inline-block;">
            S&S
          </div>
        </div>
        <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h1 style="font-size: 20px; color: #0a1628; margin: 0 0 8px 0;">Verify your email</h1>
          <p style="color: #6b7280; margin: 0 0 24px 0;">Hi ${name}, use this code to verify your email address.</p>
          <div style="text-align: center; margin: 32px 0;">
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #0a1628; background: #f3f4f6; padding: 16px 24px; border-radius: 12px; font-family: monospace;">
              ${otp}
            </div>
          </div>
          <p style="color: #9ca3af; font-size: 13px; margin: 0;">This code expires in 15 minutes. If you didn't request this, please ignore this email.</p>
        </div>
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">Sealed & Secured (Pty) Ltd &bull; Springs, Gauteng, South Africa</p>
      </div>
    `,
  });
}