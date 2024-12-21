export interface Customer {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  tags: string[];
  notes: string | null;
  status: 'active' | 'inactive';
  total_spent: number;
  last_order_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  tags?: string[];
  notes?: string;
} 