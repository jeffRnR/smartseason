export type Role = 'ADMIN' | 'AGENT';
export type Stage = 'PLANTED' | 'GROWING' | 'READY' | 'HARVESTED';
export type FieldStatus = 'Active' | 'At Risk' | 'Completed';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Field {
  id: string;
  name: string;
  cropType: string;
  plantingDate: string;
  currentStage: Stage;
  notes: string | null;
  location: string | null;
  agentId: string;
  createdAt: string;
  updatedAt: string;
  status: FieldStatus;
  daysSincePlanting: number;
  agent: {
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

export interface AuthState {
  token: string | null;
  user: User | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface CreateFieldDto {
  name: string;
  cropType: string;
  plantingDate: string;
  currentStage?: Stage;
  notes?: string;
  location?: string;
  agentId?: string;
}

export interface UpdateFieldDto extends Partial<CreateFieldDto> {}
