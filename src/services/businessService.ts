import { api } from '@/lib/api';

export const businessService = {
  checkProfile: async () => {
    const { data } = await api.get('/business/profile/check');
    return data;
  },

  createProfile: async (formData: FormData) => {
    const { data } = await api.post('/business/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  },

  // Add other business-related API calls
}; 