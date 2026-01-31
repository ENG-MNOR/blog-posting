import { Router } from 'express';
import { submitMessage, listMessages, markMessageRead } from '../controllers/messageController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', submitMessage);
router.get('/', authenticate, requireAdmin, listMessages);
router.patch('/:id/read', authenticate, requireAdmin, markMessageRead);

export default router;





