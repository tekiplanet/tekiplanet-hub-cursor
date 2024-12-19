import axios from 'axios';
import { Product } from '@/types/store';

const API_URL = import.meta.env.VITE_API_URL;

export interface ProductsResponse {
  products: Product[];
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  count: number;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url: string;
  background_color: string;
  text_color: string;
  button_text: string;
  link: string;
}

export const storeService = {
  getFeaturedProducts: async (): Promise<ProductsResponse> => {
    const response = await axios.get(`${API_URL}/products/featured`);
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await axios.get(`${API_URL}/products/categories`);
    return response.data;
  },

  getProducts: async (params: {
    search?: string;
    category?: string;
    brands?: string[];
    min_price?: number;
    max_price?: number;
  }): Promise<ProductsResponse> => {
    const response = await axios.get(`${API_URL}/products`, { params });
    return response.data;
  },

  getPromotions: async (): Promise<Promotion[]> => {
    const response = await axios.get(`${API_URL}/products/promotions`);
    return response.data;
  },

  getBrands: async (): Promise<{ id: string; name: string; }[]> => {
    const response = await axios.get(`${API_URL}/products/brands`);
    return response.data;
  }
}; 