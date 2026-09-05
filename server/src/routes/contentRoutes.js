import { Router } from 'express';
import { getContent, upsertContent } from '../controllers/contentController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Field whitelisting + JSON parsing + mongoose runValidators handle safety here;
// the multipart body makes a pre-parse zod pass impractical.
router.get('/:slug', getContent);
router.put('/:slug', authenticate, requireAdmin, upload.single('profilePhoto'), upsertContent);

export default router;
