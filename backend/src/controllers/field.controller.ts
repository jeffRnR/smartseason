import { Request, Response } from 'express';
import { fieldService } from '../services/field.service';

export class FieldController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const fields = await fieldService.getFields(req.user!.userId, req.user!.role);
      res.json({ success: true, data: fields });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getOne(req: Request, res: Response): Promise<void> {
    try {
      const field = await fieldService.getFieldById(
        req.params.id,
        req.user!.userId,
        req.user!.role
      );
      res.json({ success: true, data: field });
    } catch (err: any) {
      const status = err.message === 'Field not found' ? 404
                   : err.message === 'Access denied'  ? 403 : 500;
      res.status(status).json({ success: false, message: err.message });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const field = await fieldService.createField(req.body, req.user!.userId);
      res.status(201).json({ success: true, data: field });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const field = await fieldService.updateField(
        req.params.id,
        req.body,
        req.user!.userId,
        req.user!.role
      );
      res.json({ success: true, data: field });
    } catch (err: any) {
      const status = err.message === 'Field not found' ? 404
                   : err.message === 'Access denied'  ? 403 : 400;
      res.status(status).json({ success: false, message: err.message });
    }
  }
  async delete(req: Request, res: Response): Promise<void> {
    try {
      await fieldService.deleteField(req.params.id);
      res.json({ success: true, message: 'Field deleted successfully' });
    } catch (err: any) {
      const status = err.message === 'Field not found' ? 404 : 500;
      res.status(status).json({ success: false, message: err.message });
    }
  }

  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const stats = await fieldService.getDashboardStats(req.user!.userId, req.user!.role);
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export const fieldController = new FieldController();