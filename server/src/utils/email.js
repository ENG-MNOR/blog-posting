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

