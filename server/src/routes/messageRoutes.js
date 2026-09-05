import { Router } from 'express';
import {
  submitMessage,
  listMessages,
  markMessageRead,
  markMessageUnread,
  replyToMessage,
  deleteMessage,
} from '../controllers/messageController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { messageCreateSchema, messageReplySchema } from '../validators/index.js';

const router = Router();

router.post('/', validate(messageCreateSchema), submitMessage);

router.get('/', authenticate, requireAdmin, listMessages);
router.patch('/:id/read', authenticate, requireAdmin, markMessageRead);
router.patch('/:id/unread', authenticate, requireAdmin, markMessageUnread);
router.post('/:id/reply', authenticate, requireAdmin, validate(messageReplySchema), replyToMessage);
router.delete('/:id', authenticate, requireAdmin, deleteMessage);

export default router;
