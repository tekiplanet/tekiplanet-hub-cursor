import { apiClient } from '@/lib/api-client';

export interface Project {
  id: string;
  name: string;
  business_name: string;
  status: 'pending' | 'in_progress' | 'completed';
  start_date: string;
  end_date: string;
  progress: number;
  budget: string;
}

export const projectService = {
  async getProjects() {
    const response = await apiClient.get<{
      success: boolean;
      projects: Project[];
    }>('/projects');
    return response.data;
  }
}; 