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

  getCustomers: async () => {
    const { data } = await api.get('/business/customers');
    return data;
  },

  createCustomer: async (customerData: CreateCustomerDto) => {
    const { data } = await api.post('/business/customers', customerData);
    return data;
  },

  getCustomer: async (id: string) => {
    const { data } = await api.get(`/business/customers/${id}`);
    return data;
  },

  updateCustomer: async (id: string, customerData: Partial<CreateCustomerDto>) => {
    const { data } = await api.put(`/business/customers/${id}`, customerData);
    return data;
  },

  deleteCustomer: async (id: string) => {
    const { data } = await api.delete(`/business/customers/${id}`);
    return data;
  },

  // Add other business-related API calls
}; 