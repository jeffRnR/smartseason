import { Request, Response } from 'express';
import { fieldLogService } from '../services/fieldLog.service';

export class FieldLogController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const logs = await fieldLogService.getLogs(req.user!.userId, req.user!.role);
      res.json({ success: true, data: logs });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getByField(req: Request, res: Response): Promise<void> {
    try {
      const logs = await fieldLogService.getLogsByField(
        req.params.fieldId,
        req.user!.userId,
        req.user!.role
      );
      res.json({ success: true, data: logs });
    } catch (err: any) {
      const status = err.message === 'Field not found' ? 404
                   : err.message === 'Access denied'  ? 403 : 500;
      res.status(status).json({ success: false, message: err.message });
    }
  }
}

export const fieldLogController = new FieldLogController();