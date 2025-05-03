
// Product types definition
export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  gender?: ProductGender;
  description?: string;
  image_url?: string;
  additional_images?: string[]; // Array of additional image URLs
  video_url?: string; // URL for product video if available
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

// Schema validation types
export const ProductCategories = ['earrings', 'chains', 'bracelets', 'rings', 'necklaces', 'pendants'] as const;
export type ProductCategory = typeof ProductCategories[number];

export const ProductGenders = ['women', 'men', 'unisex'] as const;
export type ProductGender = typeof ProductGenders[number];

// Type assertion helpers for Supabase data
export function assertIsProduct(data: any): asserts data is Product {
  // Basic validation
  if (!data || typeof data !== 'object') throw new Error('Invalid product data');
  
  // Type coercion for enum fields if needed
  if (data.category && typeof data.category === 'string') {
    if (!ProductCategories.includes(data.category as any)) {
      console.warn(`Unexpected category value: ${data.category}`);
    }
  }
  
  if (data.gender && typeof data.gender === 'string') {
    if (!ProductGenders.includes(data.gender as any)) {
      console.warn(`Unexpected gender value: ${data.gender}`);
    }
  }
}

export function assertIsProductArray(data: any[]): asserts data is Product[] {
  data.forEach(item => assertIsProduct(item));
}
