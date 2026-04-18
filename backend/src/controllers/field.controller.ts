import { Role, Stage } from '@prisma/client';
import { fieldRepository } from '../repositories/field.repository';
import { userRepository } from '../repositories/user.repository';
import {
  calculateFieldStatus,
  getDaysSincePlanting,
} from '../utils/statusCalculator';
import {
  CreateFieldDto,
  DashboardStats,
  FieldWithStatus,
  UpdateFieldDto,
} from '../types';

export class FieldService {
  /**
   * Enriches a raw field record with computed status and day count.
   * Status is NEVER stored — always derived on read.
   */
  private enrichField(field: any): FieldWithStatus {
    const daysSincePlanting = getDaysSincePlanting(field.plantingDate);
    const status = calculateFieldStatus(field.currentStage, field.plantingDate);
    return { ...field, status, daysSincePlanting };
  }

  async getFields(userId: string, userRole: Role): Promise<FieldWithStatus[]> {
    const rawFields =
      userRole === Role.ADMIN
        ? await fieldRepository.findAll()
        : await fieldRepository.findByAgentId(userId);

    return rawFields.map((f) => this.enrichField(f));
  }

  async getFieldById(
    id: string,
    userId: string,
    userRole: Role
  ): Promise<FieldWithStatus> {
    const field = await fieldRepository.findById(id);
    if (!field) throw new Error('Field not found');

    if (userRole === Role.AGENT && field.agentId !== userId) {
      throw new Error('Access denied');
    }

    return this.enrichField(field);
  }

  // Admin only — enforced at the route level with requireAdmin
  async createField(dto: CreateFieldDto, adminId: string): Promise<FieldWithStatus> {
    if (!dto.agentId) throw new Error('agentId is required when creating a field');

    const agent = await userRepository.findById(dto.agentId);
    if (!agent) throw new Error('Agent not found');

    const field = await fieldRepository.create({
      name: dto.name,
      cropType: dto.cropType,
      plantingDate: new Date(dto.plantingDate),
      currentStage: (dto.currentStage as Stage) || Stage.PLANTED,
      notes: dto.notes,
      location: dto.location,
      agentId: dto.agentId,
    });

    return this.enrichField(field);
  }

  async updateField(
    id: string,
    dto: UpdateFieldDto,
    userId: string,
    userRole: Role
  ): Promise<FieldWithStatus> {
    const existing = await fieldRepository.findById(id);
    if (!existing) throw new Error('Field not found');

    // Agents can only update their own assigned fields
    if (userRole === Role.AGENT && existing.agentId !== userId) {
      throw new Error('Access denied');
    }

    let updateData: any = {};

    if (userRole === Role.ADMIN) {
      // Admins can change everything
      if (dto.name)         updateData.name = dto.name;
      if (dto.cropType)     updateData.cropType = dto.cropType;
      if (dto.plantingDate) updateData.plantingDate = new Date(dto.plantingDate);
      if (dto.currentStage) updateData.currentStage = dto.currentStage as Stage;
      if (dto.notes !== undefined) updateData.notes = dto.notes;
      if (dto.location !== undefined) updateData.location = dto.location;
      if (dto.agentId)      updateData.agentId = dto.agentId;
    } else {
      // Agents can ONLY update stage and notes — nothing else
      if (dto.currentStage) updateData.currentStage = dto.currentStage as Stage;
      if (dto.notes !== undefined) updateData.notes = dto.notes;
    }

    const updated = await fieldRepository.update(id, updateData);
    return this.enrichField(updated);
  }

  // Admin only — enforced at the route level with requireAdmin
  async deleteField(id: string): Promise<void> {
    const existing = await fieldRepository.findById(id);
    if (!existing) throw new Error('Field not found');
    await fieldRepository.delete(id);
  }

  async getDashboardStats(userId: string, userRole: Role): Promise<DashboardStats> {
    const fields = await this.getFields(userId, userRole);

    const stats: DashboardStats = {
      totalFields: fields.length,
      activeFields: 0,
      atRiskFields: 0,
      completedFields: 0,
      fieldsByStage: {
        PLANTED: 0,
        GROWING: 0,
        READY: 0,
        HARVESTED: 0,
      },
    };

    fields.forEach((f) => {
      if (f.status === 'Active')    stats.activeFields++;
      if (f.status === 'At Risk')   stats.atRiskFields++;
      if (f.status === 'Completed') stats.completedFields++;
      stats.fieldsByStage[f.currentStage]++;
    });

    return stats;
  }
}

export const fieldService = new FieldService();