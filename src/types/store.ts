export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  specifications: Record<string, any>;
  features: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

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