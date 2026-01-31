import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { bootstrapAdmin, login, refresh, logout, me, updateProfile, updatePassword } from '../controllers/authController.js';

const router = Router();

router.post('/bootstrap', bootstrapAdmin);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, updatePassword);

export default router;





