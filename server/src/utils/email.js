import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.secure,
  auth: env.smtp.user
    ? {
        user: env.smtp.user,
        pass: env.smtp.pass
      }
    : undefined
});

export const sendContactEmail = async ({ name, email, requestType = 'general', message }) => {
  if (!env.contactInbox || !env.smtp.user) {
    console.warn('SMTP not fully configured; skipping outbound email.');
    return;
  }

  await transporter.sendMail({
    from: env.smtp.user,
    to: env.contactInbox,
    subject: `New contact request (${requestType}) from ${name}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Request Type:</strong> ${requestType}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `
  });
};

export const sendReplyEmail = async ({ name, email, originalMessage, replyMessage }) => {
  if (!env.smtp.user) {
    console.warn('SMTP not fully configured; skipping outbound reply email.');
    return;
  }

  await transporter.sendMail({
    from: `"Nor Website" <${env.smtp.user}>`,
    to: email,
    subject: `Re: Your message to Nor Website`,
    html: `
      <p>Dear ${name},</p>
      <p>Thank you for contacting us. Here is our response to your message:</p>
      <hr />
      <p>${replyMessage}</p>
      <hr />
      <p style="color: #666; font-size: 0.9em;">
        <strong>Original Message:</strong><br/>
        ${originalMessage}
      </p>
      <p>Best regards,<br/>Nor Website Team<br/>norhaji@just.edu.so</p>
    `
  });
};

