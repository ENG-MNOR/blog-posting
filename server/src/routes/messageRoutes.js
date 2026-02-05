import { Router } from 'express';
import { submitMessage, listMessages, markMessageRead, replyToMessage } from '../controllers/messageController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', submitMessage);
router.get('/', authenticate, requireAdmin, listMessages);
router.patch('/:id/read', authenticate, requireAdmin, markMessageRead);
router.post('/:id/reply', authenticate, requireAdmin, replyToMessage);

export default router;





