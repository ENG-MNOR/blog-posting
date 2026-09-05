import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const WEAK_SECRETS = new Set([
  'change-me',
  'change-me-too',
  'youraccesssecretkey',
  'yourrefreshsecretkey',
  'secret',
]);

for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
  const value = process.env[key] || '';
  if (WEAK_SECRETS.has(value.toLowerCase()) || value.length < 24) {
    const warning = `[env] ${key} looks weak or is a known placeholder — set a long random value.`;
    if ((process.env.NODE_ENV || 'development') === 'production') {
      throw new Error(warning);
    }
    // eslint-disable-next-line no-console
    console.warn(warning);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:5174'];

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5001,
  clientOrigins,
  mongoUri: process.env.MONGO_URI,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  contactInbox: process.env.CONTACT_INBOX || process.env.SMTP_USER || '',
  uploadsDir: path.resolve(__dirname, '../../uploads')
};

