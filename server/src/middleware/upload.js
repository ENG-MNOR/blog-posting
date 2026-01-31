import path from 'node:path';
import multer from 'multer';
import { env } from '../config/env.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.uploadsDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    cb(null, `${base}-${timestamp}${ext}`);
  }
});

const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (_req, file, cb) => {
  if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

