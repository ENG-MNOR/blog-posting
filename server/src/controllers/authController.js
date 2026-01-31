import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { signAccessToken, signRefreshToken, setRefreshCookie } from '../utils/token.js';
import { env } from '../config/env.js';

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  titles: user.titles,
  avatarUrl: user.avatarUrl
});

export const bootstrapAdmin = async (req, res) => {
  const existing = await User.countDocuments();

  if (existing > 0) {
    return res.status(403).json({ message: 'Admin already exists' });
  }

  const { name, email, password, titles } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    titles
  });

  return res.status(201).json({ message: 'Admin created', user: sanitizeUser(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase() });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());

  setRefreshCookie(res, refreshToken);

  return res.json({
    accessToken,
    user: sanitizeUser(user)
  });
};

export const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    const payload = jwt.verify(token, env.jwt.refreshSecret);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    setRefreshCookie(res, refreshToken);

    return res.json({
      accessToken,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'strict' : 'lax'
  });

  return res.json({ message: 'Logged out' });
};

export const me = (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
};

export const updateProfile = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  user.name = name;
  await user.save();

  return res.json({ user: sanitizeUser(user), message: 'Profile updated' });
};

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password required' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const valid = await bcrypt.compare(currentPassword, user.password);

  if (!valid) {
    return res.status(401).json({ message: 'Invalid current password' });
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  user.password = hashed;
  await user.save();

  return res.json({ message: 'Password updated' });
};





