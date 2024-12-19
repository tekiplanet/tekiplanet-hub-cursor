import axios from 'axios';

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

export interface ShippingAddress {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: {
        id: string;
        name: string;
    };
    is_default: boolean;
}

export interface State {
    id: string;
    name: string;
}

export interface ShippingMethod {
    id: string;
    name: string;
    description: string;
    rate: number;
    estimated_days_min: number;
    estimated_days_max: number;
}

export const shippingService = {
    getStates: async (): Promise<State[]> => {
        const response = await axiosInstance.get('/shipping/states');
        return response.data.states;
    },

    getAddresses: async (): Promise<ShippingAddress[]> => {
        const response = await axiosInstance.get('/shipping/addresses');
        return response.data.addresses;
    },

    addAddress: async (data: Omit<ShippingAddress, 'id' | 'state'>): Promise<ShippingAddress> => {
        const response = await axiosInstance.post('/shipping/addresses', data);
        return response.data.address;
    },

    updateAddress: async (id: string, data: Omit<ShippingAddress, 'id' | 'state'>): Promise<ShippingAddress> => {
        const response = await axiosInstance.put(`/shipping/addresses/${id}`, data);
        return response.data.address;
    },

    deleteAddress: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/shipping/addresses/${id}`);
    },

    getShippingMethods: async (addressId?: string | null): Promise<ShippingMethod[]> => {
        if (!addressId) return [];
        const response = await axiosInstance.get(`/shipping/methods?address_id=${addressId}`);
        return response.data.methods;
    }
}; 