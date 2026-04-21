import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(401).json({ success: false, message: err.message });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message });
    }
  }
}

export const authController = new AuthController();
