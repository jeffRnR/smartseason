import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      const status = err.message === 'Email already registered' ? 409 : 400;
      res.status(status).json({ success: false, message: err.message });
    }
  }

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
