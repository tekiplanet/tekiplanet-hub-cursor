import { apiClient } from '@/lib/axios';

export interface TimeSlot {
  date: string;
  slots: string[];
}

export interface ConsultingBooking {
  id: string;
  hours: number;
  total_cost: number;
  selected_date: string;
  selected_time: string;
  requirements?: string;
  status: 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid';
  payment_method: string;
  created_at: string;
}

export interface ConsultingSettings {
  hourly_rate: number;
  overtime_rate: number;
  cancellation_hours: number;
}

export const consultingService = {
  getAvailableSlots: async () => {
    const response = await apiClient.get('/consulting/slots');
    return {
      slots: response.data.slots as Record<string, string[]>,
      settings: {
        hourly_rate: response.data.hourly_rate,
        overtime_rate: response.data.overtime_rate,
        cancellation_hours: response.data.cancellation_hours
      } as ConsultingSettings
    };
  },

  createBooking: async (data: {
    hours: number;
    selected_date: string;
    selected_time: string;
    requirements?: string;
    payment_method: string;
  }) => {
    const response = await apiClient.post('/consulting/bookings', data);
    return response.data;
  },

  getUserBookings: async () => {
    const response = await apiClient.get('/consulting/bookings');
    return response.data.bookings;
  },

  cancelBooking: async (bookingId: string, reason?: string) => {
    const response = await apiClient.post(`/consulting/bookings/${bookingId}/cancel`, {
      reason
    });
    return response.data;
  },

  submitReview: async (bookingId: string, data: {
    rating: number;
    comment?: string;
  }) => {
    const response = await apiClient.post(`/consulting/bookings/${bookingId}/review`, data);
    return response.data;
  }
}; 