import axios from 'axios';
import { Project, TimeEntryRequest } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/projects');
  return response.data;
};

export const createTimeEntry = async (data: TimeEntryRequest): Promise<void> => {
  await api.post('/time-entries', data);
};
