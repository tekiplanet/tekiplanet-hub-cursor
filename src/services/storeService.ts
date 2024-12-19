import axios from 'axios';
import { Product } from '@/types/store';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add interceptor to include auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ProductsResponse {
  products: {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
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

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price_changed: boolean;
}

export interface CartResponse {
  items: CartItem[];
  totals: {
    original: number;
    current: number;
  };
  currency: string;
}

export const storeService = {
  getFeaturedProducts: async (): Promise<ProductsResponse> => {
    const response = await axiosInstance.get('/products/featured');
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await axiosInstance.get('/products/categories');
    return response.data;
  },

  getProducts: async (params: {
    search?: string;
    category?: string;
    brands?: string[];
    min_price?: number;
    max_price?: number;
  }): Promise<ProductsResponse> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    if (cleanParams.brands) {
      cleanParams.brands = cleanParams.brands.join(',');
    }

    const response = await axiosInstance.get('/products', { 
      params: cleanParams
    });
    return response.data;
  },

  getPromotions: async (): Promise<Promotion[]> => {
    const response = await axiosInstance.get('/products/promotions');
    return response.data;
  },

  getBrands: async (): Promise<{ id: string; name: string; }[]> => {
    const response = await axiosInstance.get('/products/brands');
    return response.data;
  },

  getProductDetails: async (id: string): Promise<{
    product: Product;
    currency: string;
  }> => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },

  getCart: async (): Promise<CartResponse> => {
    const response = await axiosInstance.get('/cart');
    return response.data;
  },

  addToCart: async (productId: string, quantity: number): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/cart/add', {
      product_id: productId,
      quantity
    });
    return response.data;
  },

  updateCartItemQuantity: async (itemId: string, quantity: number): Promise<{ message: string }> => {
    const response = await axiosInstance.put(`/cart/items/${itemId}`, {
      quantity
    });
    return response.data;
  },

  removeCartItem: async (itemId: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/cart/items/${itemId}`);
    return response.data;
  }
}; 