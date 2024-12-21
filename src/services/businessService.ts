import { api } from '@/lib/api';

export const businessService = {
  checkProfile: async () => {
    const { data } = await api.get('/business/profile/check');
    return data;
  },

  createProfile: async (profileData: any) => {
    const { data } = await api.post('/business/profile', profileData);
    return data;
  },

  // Add other business-related API calls
}; 