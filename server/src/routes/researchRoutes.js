import { Router } from 'express';
import {
  listResearch,
  getResearch,
  createResearch,
  updateResearch,
  deleteResearch
} from '../controllers/researchController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', listResearch);
router.get('/dashboard', authenticate, requireAdmin, listResearch);
router.get('/:id', getResearch);
router.post('/', authenticate, requireAdmin, createResearch);
router.put('/:id', authenticate, requireAdmin, updateResearch);
router.delete('/:id', authenticate, requireAdmin, deleteResearch);

export default router;





