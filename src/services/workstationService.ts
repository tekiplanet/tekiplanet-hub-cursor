import { apiClient } from '@/lib/axios';

export interface WorkstationPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  duration_days: number;
  print_pages_limit: number;
  meeting_room_hours: number;
  has_locker: boolean;
  has_dedicated_support: boolean;
  allows_installments: boolean;
  installment_months: number | null;
  installment_amount: number | null;
  features: string[];
}

export interface WorkstationSubscription {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
  };
  plan: WorkstationPlan;
  tracking_code: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  payment_type: 'full' | 'installment';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  auto_renew: boolean;
  last_check_in: string | null;
  last_check_out: string | null;
  accessCards: Array<{
    id: string;
    card_number: string;
    valid_date: string;
    qr_code: string;
    is_active: boolean;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    type: 'full' | 'installment';
    installment_number: number | null;
    due_date: string;
    status: 'paid' | 'pending' | 'overdue';
  }>;
}

export const workstationService = {
  getPlans: async () => {
    try {
      console.log('Fetching plans...');
      const response = await apiClient.get('/workstation/plans');
      console.log('Plans response:', response.data);
      return response.data.plans;
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  },

  getCurrentSubscription: async () => {
    const response = await apiClient.get('/workstation/subscription');
    return response.data.subscription as WorkstationSubscription;
  },
}; 