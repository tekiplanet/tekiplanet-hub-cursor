import { apiClient } from '@/lib/axios';
import { format } from 'date-fns';

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
  cancelled_at?: string;
  cancellation_reason?: string;
  cancellation_feedback?: string;
}

export interface SubscriptionHistoryFilters {
  status?: 'active' | 'expired' | 'cancelled';
  dateRange?: [Date, Date];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
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

  createSubscription: async (
    planId: string, 
    paymentType: 'full' | 'installment',
    startDate?: Date,
    isUpgrade?: boolean
  ) => {
    const response = await apiClient.post('/workstation/subscriptions', {
      plan_id: planId,
      payment_type: paymentType,
      start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      is_upgrade: isUpgrade
    });
    return response.data;
  },

  renewSubscription: async (subscriptionId: string, planId: string) => {
    const response = await apiClient.post(`/workstation/subscriptions/${subscriptionId}/renew`, {
      plan_id: planId
    });
    return response.data;
  },

  cancelSubscription: async (subscriptionId: string, data: { reason: string; feedback?: string }) => {
    const response = await apiClient.post(`/workstation/subscriptions/${subscriptionId}/cancel`, data);
    return response.data;
  },

  getSubscriptionHistory: async (filters?: SubscriptionHistoryFilters) => {
    const params = new URLSearchParams();
    
    if (filters?.status) {
      params.append('status', filters.status);
    }
    
    if (filters?.dateRange) {
      params.append('date_range', `${filters.dateRange[0].toISOString()},${filters.dateRange[1].toISOString()}`);
    }
    
    if (filters?.sortBy) {
      params.append('sort_by', filters.sortBy);
      params.append('sort_order', filters.sortOrder || 'desc');
    }
    
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    
    if (filters?.perPage) {
      params.append('per_page', filters.perPage.toString());
    }

    const response = await apiClient.get(`/workstation/subscriptions/history?${params.toString()}`);
    return response.data.history;
  },

  downloadAccessCard: async (subscriptionId: string) => {
    const response = await apiClient.get(
      `/workstation/subscriptions/${subscriptionId}/access-card`,
      { responseType: 'blob' }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `access-card-${subscriptionId}.jpg`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  reactivateSubscription: async (planId: string, paymentType: 'full' | 'installment' = 'full') => {
    const response = await apiClient.post('/workstation/subscriptions/reactivate', {
      plan_id: planId,
      payment_type: paymentType
    });
    return response.data;
  },
}; 