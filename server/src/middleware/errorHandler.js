import multer from 'multer';
import { env } from '../config/env.js';

export const notFound = (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
  }
  return next();
};

export const errorHandler = (err, req, res, _next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors;

  // Mongoose validation → 400 with field-level detail
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    // Bad ObjectId (or similar) → treat as not found
    status = 404;
    message = 'Resource not found';
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `A record with that ${field} already exists` : 'Duplicate value';
  } else if (err instanceof multer.MulterError) {
    status = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large (max 10 MB)'
        : err.code === 'LIMIT_FILE_COUNT'
          ? 'Too many files uploaded'
          : `Upload error: ${err.message}`;
  } else if (err.name === 'ZodError') {
    status = 400;
    message = 'Validation failed';
    errors = err.issues?.map((i) => ({ path: i.path?.join('.'), message: i.message }));
  }

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(env.nodeEnv === 'production' ? {} : { stack: err.stack }),
  });
};
