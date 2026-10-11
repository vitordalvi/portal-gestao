import axios from 'axios';
import { 
  Project, 
  ProjectDetail, 
  TimeEntryRequest, 
  User, 
  Client, 
  CreateProjectRequest, 
  CreateAllocationRequest 
} from '../types';

/**
 * Cliente HTTP centralizado para comunicação com a API REST (.NET 9).
 */
const api = axios.create({
  baseURL: 'http://localhost:5062/api'
});

/**
 * Busca a listagem resumida de todos os projetos cadastrados no portal,
 * incluindo métricas de consumo, saldo de horas, avanço físico e diagnóstico de saúde.
 */
export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/projects');
  return response.data;
};

/**
 * Busca o detalhe completo de um projeto específico pelo seu ID,
 * incluindo dados do cliente, alocações de analistas e marcos de entrega.
 */
export const getProjectById = async (id: string): Promise<ProjectDetail> => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

/**
 * Cadastra um novo projeto de consultoria com escopo de horas vendidas e valor total.
 */
export const createProject = async (data: CreateProjectRequest): Promise<ProjectDetail> => {
  const response = await api.post('/projects', data);
  return response.data;
};

/**
 * Aloca um analista a um projeto específico com horas previstas e taxa de custo/hora.
 */
export const allocateUserToProject = async (projectId: string, data: CreateAllocationRequest): Promise<void> => {
  await api.post(`/projects/${projectId}/allocations`, data);
};

/**
 * Atualiza os parâmetros de alocação de um analista (horas previstas, taxa/hora e vigência).
 * Recalcula a projeção e os custos realizados no projeto.
 */
export const updateAllocation = async (
  projectId: string, 
  allocationId: string, 
  data: { allocatedHours: number; hourlyCost: number; startDate?: string; endDate?: string }
): Promise<void> => {
  await api.put(`/projects/${projectId}/allocations/${allocationId}`, data);
};

/**
 * Remove a alocação de um analista de um projeto.
 * A API bloqueia a exclusão caso já existam apontamentos de horas vinculados.
 */
export const deleteAllocation = async (projectId: string, allocationId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}/allocations/${allocationId}`);
};

/**
 * Registra um novo apontamento de horas de um analista para um projeto.
 */
export const createTimeEntry = async (data: TimeEntryRequest): Promise<void> => {
  await api.post('/time-entries', data);
};

/**
 * Retorna a lista de usuários analistas e coordenadores disponíveis no sistema.
 */
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

/**
 * Retorna a lista de clientes cadastrados.
 */
export const getClients = async (): Promise<Client[]> => {
  const response = await api.get('/clients');
  return response.data;
};

/**
 * Cria um novo marco de entrega (Milestone) associado ao projeto.
 */
export const createMilestone = async (projectId: string, data: { name: string; weight: number }): Promise<void> => {
  await api.post(`/projects/${projectId}/milestones`, data);
};

/**
 * Atualiza o nome ou peso percentual de um marco de entrega existente.
 */
export const updateMilestone = async (projectId: string, milestoneId: string, data: { name: string; weight: number }): Promise<void> => {
  await api.put(`/projects/${projectId}/milestones/${milestoneId}`, data);
};

/**
 * Exclui um marco de entrega do projeto, recalculando o avanço físico ponderado.
 */
export const deleteMilestone = async (projectId: string, milestoneId: string): Promise<void> => {
  await api.delete(`/projects/${projectId}/milestones/${milestoneId}`);
};

/**
 * Alterna o status de conclusão do marco (pendente <-> concluído),
 * recalculando o avanço físico e a saúde global do projeto.
 */
export const toggleMilestone = async (projectId: string, milestoneId: string): Promise<void> => {
  await api.patch(`/projects/${projectId}/milestones/${milestoneId}/toggle`);
};

/**
 * Dispara sincronização sob demanda do projeto com o ERP TOTVS RM / Protheus.
 */
export const syncProject = async (projectId: string): Promise<ProjectDetail> => {
  const response = await api.post(`/projects/${projectId}/sync`);
  return response.data;
};


