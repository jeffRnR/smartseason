import { Router } from 'express';
import { fieldController } from '../controllers/field.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// All field routes require authentication
router.use(authenticate);

router.get('/dashboard', (req, res) => fieldController.getDashboard(req, res));
router.get('/', (req, res) => fieldController.getAll(req, res));
router.get('/:id', (req, res) => fieldController.getOne(req, res));

// Admin only — agents are assigned fields, not create them
router.post('/', requireAdmin, (req, res) => fieldController.create(req, res));
router.delete('/:id', requireAdmin, (req, res) => fieldController.delete(req, res));

// Agents can only update stage/notes on their assigned fields
router.patch('/:id', (req, res) => fieldController.update(req, res));

export default router;