import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { userRepository } from '../repositories/user.repository';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/', async (req, res) => {
  try {
    const users = await userRepository.findAll();
    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
