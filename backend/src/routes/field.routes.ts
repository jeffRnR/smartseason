import { Router } from 'express';
import { fieldController } from '../controllers/field.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', (req, res) => fieldController.getDashboard(req, res));
router.get('/', (req, res) => fieldController.getAll(req, res));
router.get('/:id', (req, res) => fieldController.getOne(req, res));

router.post('/', requireAdmin, (req, res) => fieldController.create(req, res));
router.delete('/:id', requireAdmin, (req, res) => fieldController.delete(req, res));

router.patch('/:id', (req, res) => fieldController.update(req, res));

export default router;