/**
 * Usuário autenticado ou membro da equipe (Analista, Coordenador/Gerente ou Diretor).
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: number; // 0 = Director, 1 = ProjectManager, 2 = Analyst
}

/**
 * Cliente contratante dos serviços de consultoria.
 */
export interface Client {
  id: string;
  name: string;
  cnpj: string;
  segment: string;
}

/**
 * Marco de entrega do projeto (Milestone), ponderado por peso percentual.
 */
export interface Milestone {
  id: string;
  name: string;
  weight: number;
  isCompleted: boolean;
}

/**
 * Detalhe de alocação de um analista em um projeto específico.
 */
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

/**
 * Entidade detalhada de projeto para a tela de detalhes (ProjectDetailPage).
 */
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
  /** Lista de motivos explicativos para o status de saúde */
  healthReasons?: string[];
  financialMargin: number;
  realizedCost: number;
  client: Client | null;
  milestones: Milestone[];
  allocations: AllocationDetail[];
}

/**
 * Entidade resumida de projeto para cards na Dashboard e lista de projetos.
 */
export interface Project {
  id: string;
  name: string;
  clientName?: string;
  soldHours: number;
  consumedHours: number;
  hourBalance: number;
  physicalProgressPercentage: number;
  healthStatus: 'Saudável' | 'Atenção' | 'Crítico';
  /** Lista de diagnósticos de saúde gerados pelo backend */
  healthReasons?: string[];
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

