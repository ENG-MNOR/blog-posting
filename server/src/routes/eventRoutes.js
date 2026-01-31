import { Router } from 'express';
import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/eventController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', authenticate, requireAdmin, upload.array('images', 3), createEvent);
router.put('/:id', authenticate, requireAdmin, upload.array('images', 3), updateEvent);
router.delete('/:id', authenticate, requireAdmin, deleteEvent);

export default router;





