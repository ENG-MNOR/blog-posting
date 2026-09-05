import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env.js';

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const removeFile = async (filename) => {
  try {
    await fs.unlink(path.join(env.uploadsDir, filename));
  } catch {
    /* best effort */
  }
};

export const handleUpload = (expect) => async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File is required' });
  }

  const isImage = IMAGE_MIMES.has(req.file.mimetype);
  const isPdf = req.file.mimetype === 'application/pdf';
  const ok = expect === 'image' ? isImage : isPdf;

  if (!ok) {
    await removeFile(req.file.filename);
    return res
      .status(400)
      .json({ message: `Expected ${expect === 'image' ? 'an image' : 'a PDF'} file` });
  }

  res.status(201).json({
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });
};
