export interface Project {
  id: string;
  name: string;
  soldHours: number;
  consumedHours: number;
  hourBalance: number;
  physicalProgressPercentage: number;
  healthStatus: 'Saudável' | 'Atenção' | 'Crítico';
  financialMargin: number;
}

export interface TimeEntryRequest {
  projectId: string;
  userId: string;
  date: string;
  hours: number;
  description: string;
}
