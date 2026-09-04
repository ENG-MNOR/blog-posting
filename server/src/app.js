import 'express-async-errors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import router from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = new Set(env.clientOrigins);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  if (env.nodeEnv !== 'production') {
    try {
      const { hostname } = new URL(origin);
      return hostname === 'localhost' || hostname === '127.0.0.1';
    } catch {
      return false;
    }
  }
  return false;
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const app = express();

app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120
  })
);
app.use(morgan('dev'));

// Serve uploads with CORS headers
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isAllowedOrigin(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Vary', 'Origin');
  }
  next();
}, express.static(path.resolve(env.uploadsDir)));

app.use('/api', router);

// Serve static files from React app
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

// Handle any requests that don't match the above
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.use(errorHandler);

export { app };

