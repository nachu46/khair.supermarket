export interface User {
  id: string;
  username: string;
  role: 'superadmin' | 'admin' | 'cashier';
  company_id: string | null;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  gst_number?: string;
  logo_url?: string;
  subscription_plan?: string;
  subscription_status: 'trial' | 'active' | 'expired';
  subscription_expiry?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  barcode?: string;
  category?: string;
  price_mrp: number;
  price_cost: number;
  stock: number;
  low_stock_threshold: number;
  supplier_id?: string;
  expiry_date?: string;
  hsn_code?: string;
  tax_rate: number;
  emoji?: string;
  company_id: string;
}

export interface CartItem extends Product {
  qty: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyalty_points: number;
}
