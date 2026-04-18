import { Role, Stage } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export type FieldStatus = 'Active' | 'At Risk' | 'Completed';

export interface FieldWithStatus {
  id: string;
  name: string;
  cropType: string;
  plantingDate: Date;
  currentStage: Stage;
  notes: string | null;
  location: string | null;
  agentId: string;
  createdAt: Date;
  updatedAt: Date;
  status: FieldStatus;
  daysSincePlanting: number;
  agent?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DashboardStats {
  totalFields: number;
  activeFields: number;
  atRiskFields: number;
  completedFields: number;
  fieldsByStage: Record<Stage, number>;
}

export interface CreateFieldDto {
  name: string;
  cropType: string;
  plantingDate: string;
  currentStage?: Stage;
  notes?: string;
  location?: string;
  agentId?: string; // Admin only
}

export interface UpdateFieldDto {
  name?: string;
  cropType?: string;
  plantingDate?: string;
  currentStage?: Stage;
  notes?: string;
  location?: string;
  agentId?: string; // Admin only
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
