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
  assigned_professional_id?: string | null;
  application_status?: 'pending' | 'approved' | 'rejected' | 'withdrawn';
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
  cannot_apply_reason?: string;
  professional?: {
    id: string;
    category_id: string;
  } | null;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Professional {
  id: string;
  category_id: string;
  status: 'active' | 'inactive' | 'suspended';
  // ... other fields
}

interface ProfileCheckResponse {
  has_profile: boolean;
  profile: Professional | null;
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
  },

  withdrawApplication: async (applicationId: string) => {
    const { data } = await api.post(`/hustle-applications/${applicationId}/withdraw`);
    return data;
  },

  checkProfessionalProfile: async () => {
    const { data } = await api.get('/professional/profile/check');
    return data;
  }
}; 