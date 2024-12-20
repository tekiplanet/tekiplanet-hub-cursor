import { apiClient } from '@/lib/axios';

export interface ProfessionalCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
  order: number;
}

export const professionalCategoryService = {
  getCategories: async (): Promise<ProfessionalCategory[]> => {
    const response = await apiClient.get('/professional/categories');
    return response.data.categories || [];
  },

  getCategory: async (id: string): Promise<ProfessionalCategory> => {
    const response = await apiClient.get(`/professional/categories/${id}`);
    return response.data.category;
  }
}; 