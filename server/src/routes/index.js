import { Router } from 'express';
import authRoutes from './authRoutes.js';
import researchRoutes from './researchRoutes.js';
import eventRoutes from './eventRoutes.js';
import contentRoutes from './contentRoutes.js';
import messageRoutes from './messageRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = Router();

router.get('/health', (_, res) => res.json({ status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/research', researchRoutes);
router.use('/events', eventRoutes);
router.use('/content', contentRoutes);
router.use('/messages', messageRoutes);
router.use('/upload', uploadRoutes);

export default router;





