export interface User {
  id: string;
  name: string;
  email: string;
  role: number; // 0 = Director, 1 = ProjectManager, 2 = Analyst
}

export interface Client {
  id: string;
  name: string;
  cnpj: string;
  segment: string;
}

export interface Milestone {
  id: string;
  name: string;
  weight: number;
  isCompleted: boolean;
}

export interface AllocationDetail {
  id: string;
  allocatedHours: number;
  hourlyCost: number;
  startDate: string;
  endDate: string;
  consumedHours: number;
  totalCost: number;
  user: User | null;
}

export interface ProjectDetail {
  id: string;
  name: string;
  soldHours: number;
  plannedHours: number;
  totalValue: number;
  startDate: string;
  endDate: string;
  status: string;
  erpId: string;
  consumedHours: number;
  hourBalance: number;
  physicalProgressPercentage: number;
  healthStatus: 'Saudável' | 'Atenção' | 'Crítico';
  financialMargin: number;
  realizedCost: number;
  client: Client | null;
  milestones: Milestone[];
  allocations: AllocationDetail[];
}

export interface Project {
  id: string;
  name: string;
  clientName?: string;
  soldHours: number;
  consumedHours: number;
  hourBalance: number;
  physicalProgressPercentage: number;
  healthStatus: 'Saudável' | 'Atenção' | 'Crítico';
  financialMargin: number;
  allocatedUserIds?: string[];
  erpId?: string;
}

export interface CreateProjectRequest {
  name: string;
  clientId: string;
  soldHours: number;
  plannedHours: number;
  totalValue: number;
  startDate: string;
  endDate: string;
}

export interface CreateAllocationRequest {
  userId: string;
  allocatedHours: number;
  hourlyCost: number;
  startDate?: string;
  endDate?: string;
}

export interface TimeEntryRequest {
  projectId: string;
  userId: string;
  date: string;
  hours: number;
  description: string;
}

export interface CreateMilestoneRequest {
  name: string;
  weight: number;
}

