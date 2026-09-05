import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  loginSchema,
  profileSchema,
  passwordChangeSchema,
  userCreateSchema,
  userUpdateSchema,
} from '../validators/index.js';
import {
  bootstrapAdmin,
  login,
  refresh,
  logout,
  me,
  updateProfile,
  updatePassword,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/authController.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/bootstrap', bootstrapAdmin);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, validate(profileSchema), updateProfile);
router.put('/password', authenticate, validate(passwordChangeSchema), updatePassword);

// Team management
router.get('/users', authenticate, requireAdmin, getUsers);
router.post(
  '/users',
  authenticate,
  requireAdmin,
  upload.single('avatar'),
  validate(userCreateSchema),
  createUser,
);
router.put(
  '/users/:id',
  authenticate,
  requireAdmin,
  upload.single('avatar'),
  validate(userUpdateSchema),
  updateUser,
);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);

export default router;
