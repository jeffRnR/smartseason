import { Router } from 'express';
import { fieldLogController } from '../controllers/fieldLog.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res) => fieldLogController.getAll(req, res));
router.get('/field/:fieldId', (req, res) => fieldLogController.getByField(req, res));

export default router;