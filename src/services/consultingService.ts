import { apiClient } from '@/lib/axios';

export interface TimeSlot {
  id: string;
  time: string;
}

export interface ConsultingBooking {
  id: string;
  user_id: string;
  hours: number;
  total_cost: number;
  selected_date: string;
  selected_time: string;
  requirements?: string;
  status: 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  payment_status: 'paid' | 'pending';
  payment_method: string;
  created_at: string;
  review?: {
    id: string;
    rating: number;
    comment?: string;
  };
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
    slot_id: string;
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

  cancelBooking: async (bookingId: string, reason: string) => {
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
  },

  getBookingDetails: async (bookingId: string): Promise<ConsultingBooking> => {
    const response = await apiClient.get(`/consulting/bookings/${bookingId}`);
    return response.data.booking;
  }
}; 