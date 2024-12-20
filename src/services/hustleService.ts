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
  status: 'open' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  application_status?: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  assigned_professional_id?: string;
  initial_payment_released: boolean;
  final_payment_released: boolean;
  messages?: Array<{
    id: string;
    message: string;
    sender_type: 'admin' | 'professional';
    user: {
      name: string;
      avatar?: string;
    };
    created_at: string;
  }>;
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