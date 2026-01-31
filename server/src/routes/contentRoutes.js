import { Router } from 'express';
import { getContent, upsertContent } from '../controllers/contentController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/:slug', getContent);
router.put('/:slug', authenticate, requireAdmin, upload.single('profilePhoto'), upsertContent);

export default router;





