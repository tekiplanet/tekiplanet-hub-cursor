import { api } from '@/lib/api';
import { apiClient } from '@/lib/axios';

interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  address?: string;
  tags?: string[];
}

interface CreateInvoiceDto {
  customer_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  due_date: string;
  notes?: string;
  theme_color?: string;
  items?: {
    description?: string;
    quantity?: number;
    unit_price?: number;
    amount?: number;
  }[];
}

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

  getInvoice: async (id: string) => {
    const response = await api.get(`/business/invoices/${id}`);
    return response.data;
  },

  downloadInvoice: async (id: string) => {
    const response = await api.get(`/business/invoices/${id}/download`, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${id}.pdf`);
    
    // Append to html link element page
    document.body.appendChild(link);
    
    // Start download
    link.click();
    
    // Clean up and remove the link
    link.parentNode?.removeChild(link);
  },

  sendInvoice: async (id: string) => {
    const response = await api.post(`/business/invoices/${id}/send`);
    return response.data;
  },

  recordPayment: async (id: string, data: {
    amount: number;
    date: string;
    notes?: string;
  }) => {
    const response = await api.post(`/business/invoices/${id}/payments`, data);
    return response.data;
  },

  updateInvoiceStatus: async (id: string, status: string) => {
    const response = await api.patch(`/business/invoices/${id}/status`, { status });
    return response.data;
  },

  getCustomerTransactions: async (customerId: string) => {
    const response = await api.get(`/business/customers/${customerId}/transactions`);
    return response.data;
  },

  // Add other business-related API calls
}; 