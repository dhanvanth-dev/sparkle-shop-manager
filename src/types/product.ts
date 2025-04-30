
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  gender?: string;
  description?: string;
  image_url?: string;
  is_new_arrival: boolean;
  is_sold_out: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: Product;
}

export interface SavedItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  expires_at: string;
  product: Product;
}
