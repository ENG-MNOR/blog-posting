import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { 
  bootstrapAdmin, login, refresh, logout, me, updateProfile, updatePassword,
  getUsers, createUser, updateUser, deleteUser
} from '../controllers/authController.js';

import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/bootstrap', bootstrapAdmin);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, updatePassword);

// User Management
router.get('/users', authenticate, requireAdmin, getUsers);
router.post('/users', authenticate, requireAdmin, upload.single('avatar'), createUser);
router.put('/users/:id', authenticate, requireAdmin, upload.single('avatar'), updateUser);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);

export default router;





