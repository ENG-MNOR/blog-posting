import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 40) || 'file';
    cb(null, `${base}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  }
});

const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const allowedExt = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp']);

const fileFilter = (_req, file, cb) => {
  // Explicit allow-list only — no `startsWith('image/')`, which let SVG
  // (image/svg+xml) through and enabled stored XSS from /uploads.
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedMimes.includes(file.mimetype) && allowedExt.has(ext)) {
    return cb(null, true);
  }
  const err = new Error('Unsupported file type. Allowed: PDF, JPG, PNG, WEBP.');
  err.status = 400;
  return cb(err);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

