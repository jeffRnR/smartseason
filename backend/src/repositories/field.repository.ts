import { Stage } from '@prisma/client';
import prisma from '../utils/prisma';

const fieldWithAgent = {
  agent: {
    select: { id: true, name: true, email: true },
  },
};

export class FieldRepository {
  async findAll() {
    return prisma.field.findMany({
      include: fieldWithAgent,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByAgentId(agentId: string) {
    return prisma.field.findMany({
      where: { agentId },
      include: fieldWithAgent,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.field.findUnique({
      where: { id },
      include: fieldWithAgent,
    });
  }

  async create(data: {
    name: string;
    cropType: string;
    plantingDate: Date;
    currentStage?: Stage;
    notes?: string;
    location?: string;
    agentId: string;
  }) {
    return prisma.field.create({
      data,
      include: fieldWithAgent,
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      cropType?: string;
      plantingDate?: Date;
      currentStage?: Stage;
      notes?: string;
      location?: string;
      agentId?: string;
    }
  ) {
    return prisma.field.update({
      where: { id },
      data,
      include: fieldWithAgent,
    });
  }

  async delete(id: string) {
    return prisma.field.delete({ where: { id } });
  }

  async countByStage(agentId?: string): Promise<Record<Stage, number>> {
    const where = agentId ? { agentId } : {};
    const counts = await prisma.field.groupBy({
      by: ['currentStage'],
      where,
      _count: { currentStage: true },
    });

    const result: Record<Stage, number> = {
      PLANTED: 0,
      GROWING: 0,
      READY: 0,
      HARVESTED: 0,
    };

    counts.forEach((c) => {
      result[c.currentStage] = c._count.currentStage;
    });

    return result;
  }
}

export const fieldRepository = new FieldRepository();
