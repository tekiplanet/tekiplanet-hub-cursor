import { api } from '@/lib/api';
import { apiClient } from '@/lib/axios';

export const businessService = {
  checkProfile: async () => {
    const { data } = await apiClient.get('/business/profile/check');
    return data;
  },

  createProfile: async (formData: FormData) => {
    const { data } = await apiClient.post('/business/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  },

  getCustomers: async () => {
    const { data } = await apiClient.get('/business/customers');
    return data;
  },

  createCustomer: async (customerData: CreateCustomerDto) => {
    const { data } = await apiClient.post('/business/customers', customerData);
    return data;
  },

  getCustomer: async (id: string) => {
    const { data } = await apiClient.get(`/business/customers/${id}`);
    return data;
  },

  updateCustomer: async (id: string, customerData: Partial<CreateCustomerDto>) => {
    const { data } = await apiClient.put(`/business/customers/${id}`, customerData);
    return data;
  },

  deleteCustomer: async (id: string) => {
    const { data } = await apiClient.delete(`/business/customers/${id}`);
    return data;
  },

  createInvoice: async (data: CreateInvoiceDto) => {
    const { data: response } = await apiClient.post('/business/invoices', data);
    return response;
  },

  getCustomerInvoices: async (customerId: string) => {
    const { data } = await apiClient.get(`/business/customers/${customerId}/invoices`);
    return data;
  },

  // Add other business-related API calls
}; 