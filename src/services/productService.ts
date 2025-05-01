
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductFormData, assertIsProduct, assertIsProductArray } from '@/types/product';

/**
 * Get all products
 */
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false }) as any;

  if (error || !data) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Assert the type safety
  assertIsProductArray(data);
  return data as Product[];
};

/**
 * Get a product by ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single() as any;

  if (error || !data) {
    console.error('Error fetching product:', error);
    return null;
  }

  assertIsProduct(data);
  return data as Product;
};

/**
 * Create a new product
 */
export const createProduct = async (formData: ProductFormData): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .insert(formData)
    .select()
    .single() as any;
    
  if (error || !data) {
    console.error('Error creating product:', error);
    return null;
  }

  assertIsProduct(data);
  return data as Product;
};

/**
 * Update a product
 */
export const updateProduct = async (id: string, formData: ProductFormData): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .update(formData)
    .eq('id', id)
    .select()
    .single() as any;
  
  if (error || !data) {
    console.error('Error updating product:', error);
    return null;
  }

  assertIsProduct(data);
  return data as Product;
};

/**
 * Delete a product
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id) as any;
  
  return !error;
};
