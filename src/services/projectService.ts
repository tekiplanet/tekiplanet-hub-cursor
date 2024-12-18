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

export interface ProjectStage {
  id: string;
  name: string;
  description: string | null;
  status: string;
  order: number;
  start_date: string;
  end_date: string | null;
}

export interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  role: string;
  status: string;
  joined_at: string;
  left_at: string | null;
}

export interface ProjectFile {
  id: string;
  name: string;
  file_path: string;
  file_size: string;
  file_type: string;
}

export interface ProjectInvoice {
  id: string;
  invoice_number: string;
  amount: string;
  status: string;
  due_date: string;
  paid_at: string | null;
}

export interface ProjectDetail extends Project {
  description: string;
  stages: ProjectStage[];
  team_members: TeamMember[];
  files: ProjectFile[];
  invoices: ProjectInvoice[];
}

export const projectService = {
  async getProjects() {
    const response = await apiClient.get<{
      success: boolean;
      projects: Project[];
    }>('/projects');
    return response.data;
  },

  async getProject(id: string) {
    const response = await apiClient.get<{
      success: boolean;
      project: ProjectDetail;
    }>(`/projects/${id}`);
    return response.data;
  }
}; 