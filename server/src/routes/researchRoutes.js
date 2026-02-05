import { Router } from 'express';
import {
  listResearch,
  listDashboardResearch,
  getResearch,
  createResearch,
  updateResearch,
  deleteResearch
} from '../controllers/researchController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', listResearch);
router.get('/dashboard', authenticate, listDashboardResearch);
router.get('/:id', getResearch);
router.post('/', authenticate, createResearch);
router.put('/:id', authenticate, updateResearch);
router.delete('/:id', authenticate, deleteResearch);

export default router;





