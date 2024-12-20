import { api } from '@/lib/api';

export interface Hustle {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  budget: number;
  deadline: string;
  requirements: string;
  applications_count: number;
  has_applied: boolean;
  can_apply: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const hustleService = {
  getHustles: async (params?: { 
    category_id?: string;
    search?: string;
  }) => {
    const { data } = await api.get('/hustles', { params });
    return data;
  },

  getCategories: async () => {
    const { data } = await api.get('/professional/categories');
    return data.categories;
  },

  getHustleDetails: async (id: string) => {
    const { data } = await api.get(`/hustles/${id}`);
    return data;
  },

  applyForHustle: async (hustleId: string) => {
    const { data } = await api.post(`/hustles/${hustleId}/apply`);
    return data;
  }
}; 