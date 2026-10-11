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

const api = axios.create({
  baseURL: 'http://localhost:5062/api'
});

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/projects');
  return response.data;
};

export const getProjectById = async (id: string): Promise<ProjectDetail> => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

export const createProject = async (data: CreateProjectRequest): Promise<ProjectDetail> => {
  const response = await api.post('/projects', data);
  return response.data;
};

export const allocateUserToProject = async (projectId: string, data: CreateAllocationRequest): Promise<void> => {
  await api.post(`/projects/${projectId}/allocations`, data);
};

export const createTimeEntry = async (data: TimeEntryRequest): Promise<void> => {
  await api.post('/time-entries', data);
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const getClients = async (): Promise<Client[]> => {
  const response = await api.get('/clients');
  return response.data;
};

export const createMilestone = async (projectId: string, data: { name: string; weight: number }): Promise<void> => {
  await api.post(`/projects/${projectId}/milestones`, data);
};

export const toggleMilestone = async (projectId: string, milestoneId: string): Promise<void> => {
  await api.patch(`/projects/${projectId}/milestones/${milestoneId}/toggle`);
};
