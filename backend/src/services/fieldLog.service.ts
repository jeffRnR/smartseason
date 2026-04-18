import { Role } from '@prisma/client';
import { fieldLogRepository } from '../repositories/fieldLog.repository';
import { fieldRepository } from '../repositories/field.repository';

export class FieldLogService {
  async getLogs(userId: string, userRole: Role) {
    if (userRole === Role.ADMIN) {
      return fieldLogRepository.findAll();
    }
    return fieldLogRepository.findByAgentId(userId);
  }

  async getLogsByField(fieldId: string, userId: string, userRole: Role) {
    const field = await fieldRepository.findById(fieldId);
    if (!field) throw new Error('Field not found');

    if (userRole === Role.AGENT && field.agentId !== userId) {
      throw new Error('Access denied');
    }

    return fieldLogRepository.findByFieldId(fieldId);
  }
}

export const fieldLogService = new FieldLogService();