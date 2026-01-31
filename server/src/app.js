import 'express-async-errors';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import router from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const allowedOrigins = new Set(env.clientOrigins);
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.set('trust proxy', 1);

// app.use(cors(corsOptions));
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
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
}, express.static(path.resolve(env.uploadsDir)));

app.use('/api', router);

app.use(errorHandler);

export { app };

