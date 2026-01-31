import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccessToken = (userId) =>
  jwt.sign({ sub: userId }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn
  });

export const signRefreshToken = (userId) =>
  jwt.sign({ sub: userId }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn
  });

export const setRefreshCookie = (res, token) => {
  const maxAge =
    env.jwt.refreshExpiresIn.endsWith('d')
      ? parseInt(env.jwt.refreshExpiresIn, 10) * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;

  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'strict' : 'lax',
    maxAge
  });
};





