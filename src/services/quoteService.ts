import { apiClient } from '@/lib/api-client';

export const quoteService = {
  async getQuoteDetails(quoteId: string) {
    try {
      const response = await apiClient.get(`/quotes/${quoteId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quote details:', error);
      throw error;
    }
  },

  async sendMessage(quoteId: string, message: string) {
    try {
      const response = await apiClient.post(`/quotes/${quoteId}/messages`, { message });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}; 