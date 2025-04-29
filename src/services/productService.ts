
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductFormData } from '@/types/product';
import { toast } from 'sonner';

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    toast.error('Failed to load products');
    return [];
  }

  return data || [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    toast.error('Failed to load product details');
    return null;
  }

  return data;
}

export async function createProduct(product: ProductFormData): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    toast.error('Failed to create product');
    return null;
  }

  toast.success('Product created successfully');
  return data;
}

export async function updateProduct(id: string, product: ProductFormData): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    toast.error('Failed to update product');
    return null;
  }

  toast.success('Product updated successfully');
  return data;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    toast.error('Failed to delete product');
    return false;
  }

  toast.success('Product deleted successfully');
  return true;
}

export async function uploadProductImage(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('product_images')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading image:', error);
    toast.error('Failed to upload image');
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product_images')
    .getPublicUrl(data.path);

  return publicUrl;
}
