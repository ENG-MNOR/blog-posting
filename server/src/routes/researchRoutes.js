import { Router } from 'express';
import {
  listResearch,
  getResearch,
  createResearch,
  updateResearch,
  deleteResearch,
} from '../controllers/researchController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { researchCreateSchema, researchUpdateSchema } from '../validators/index.js';

const router = Router();

router.get('/', listResearch);
router.get('/dashboard', authenticate, requireAdmin, listResearch);
router.get('/:id', getResearch);
router.post('/', authenticate, requireAdmin, validate(researchCreateSchema), createResearch);
router.put('/:id', authenticate, requireAdmin, validate(researchUpdateSchema), updateResearch);
router.delete('/:id', authenticate, requireAdmin, deleteResearch);

export default router;
