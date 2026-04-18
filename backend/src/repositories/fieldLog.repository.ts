import { Stage } from '@prisma/client';
import prisma from '../utils/prisma';

const logWithRelations = {
  agent: { select: { id: true, name: true, email: true } },
  field: { select: { id: true, name: true, cropType: true } },
};

export class FieldLogRepository {
  async create(data: {
    fieldId: string;
    agentId: string;
    prevStage: Stage;
    newStage: Stage;
    notes?: string | null;
  }) {
    return prisma.fieldLog.create({
      data,
      include: logWithRelations,
    });
  }

  async findAll() {
    return prisma.fieldLog.findMany({
      include: logWithRelations,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByFieldId(fieldId: string) {
    return prisma.fieldLog.findMany({
      where: { fieldId },
      include: logWithRelations,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByAgentId(agentId: string) {
    return prisma.fieldLog.findMany({
      where: { field: { agentId } },
      include: logWithRelations,
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const fieldLogRepository = new FieldLogRepository();