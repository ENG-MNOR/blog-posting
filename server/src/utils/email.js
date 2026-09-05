import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.secure,
  auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
});

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const smtpReady = () => Boolean(env.smtp.host && env.smtp.user);

export const sendContactEmail = async ({ name, email, requestType = 'other', message }) => {
  if (!env.contactInbox || !smtpReady()) {
    console.warn('SMTP not fully configured; skipping contact notification.');
    return;
  }

  await transporter.sendMail({
    from: env.smtp.user,
    to: env.contactInbox,
    replyTo: email,
    subject: `New ${escapeHtml(requestType)} request from ${escapeHtml(name)}`,
    html: `
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Request type:</strong> ${escapeHtml(requestType)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
    `,
  });
};

export const sendReplyEmail = async ({ to, name, reply }) => {
  if (!smtpReady()) {
    console.warn('SMTP not fully configured; skipping reply email.');
    return;
  }

  await transporter.sendMail({
    from: env.smtp.user,
    to,
    subject: 'Re: your message to Nor Haji Osman',
    html: `
      <p>Hi ${escapeHtml(name)},</p>
      <p>${escapeHtml(reply).replace(/\n/g, '<br/>')}</p>
      <p>— Nor Haji Osman</p>
    `,
  });
};
