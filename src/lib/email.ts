import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

const FROM_EMAIL = process.env.RESEND_EMAIL_FROM || 'orders@ssproc.co.za';

export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  if (!resend) {
    console.log(`[EMAIL DISABLED] To: ${to}, Subject: ${subject}`);
    console.log(body);
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      text: body,
    });

    if (error) {
      console.error(`[EMAIL ERROR] To: ${to}:`, error);
      return false;
    }

    console.log(`[EMAIL SENT] To: ${to}, ID: ${data?.id}`);
    return true;
  } catch (e) {
    console.error(`[EMAIL ERROR] To: ${to}:`, e);
    return false;
  }
}

export async function sendOtpEmail(email: string, name: string, otp: string): Promise<boolean> {
  const body = `Hi ${name},

Your verification code for Sealed & Secured is: ${otp}

This code expires in 15 minutes.

If you didn't create an account, please ignore this email.

Regards,
Sealed & Secured Team`;

  return sendEmail(email, `Your verification code: ${otp}`, body);
}
