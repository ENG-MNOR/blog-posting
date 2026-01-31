import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { handleUpload } from '../controllers/uploadController.js';

const router = Router();

router.post('/pdf', authenticate, requireAdmin, upload.single('file'), handleUpload);
router.post('/image', authenticate, requireAdmin, upload.single('file'), handleUpload);

export default router;





