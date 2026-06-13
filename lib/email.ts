import nodemailer from 'nodemailer';

// Preferred: Gmail-style config (like your sample)
const gmailUser = process.env.EMAIL_USER;
const gmailPass = process.env.EMAIL_PASS;

// Fallback: generic SMTP config
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const fromAddress =
  process.env.EMAIL_FROM || gmailUser || smtpUser || 'no-reply@example.com';

function createTransport() {
  // If Gmail creds are provided, use Gmail service (like your example)
  if (gmailUser && gmailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });
  }

  // Otherwise fall back to generic SMTP if configured
  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  console.warn('SMTP/Gmail env vars not set; email sending disabled.');
  return null;
}

export async function sendEmployeeTempPasswordEmail(params: {
  to: string;
  employeeName: string;
  tempPassword: string;
}) {
  const transport = createTransport();
  if (!transport) {
    console.log(
      `Email sending is disabled; would send temp password "${params.tempPassword}" to ${params.to}`
    );
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Your temporary password</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
          text-align: center;
        }
        .container {
          width: 100%;
          max-width: 600px;
          background-color: #ffffff;
          margin: 30px auto;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #111827;
        }
        p {
          font-size: 16px;
          color: #374151;
        }
        .code {
          display: inline-block;
          margin-top: 16px;
          padding: 10px 20px;
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 0.08em;
          background-color: #111827;
          color: #ffffff;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Welcome to Ahadu</h2>
        <p>Hi ${params.employeeName},</p>
        <p>Your account has been created in the Ahadu company dashboard.</p>
        <p>Use the following temporary password to sign in. You will be asked to change it after logging in.</p>
        <div class="code">${params.tempPassword}</div>
        <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
          If you did not expect this email, you can safely ignore it.
        </p>
      </div>
    </body>
    </html>
  `;

  await transport.sendMail({
    from: fromAddress,
    to: params.to,
    subject: 'Your temporary password',
    html,
  });
}

