
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductCategory, ProductFormData } from "@/types/product";
import { getCachedProducts, setCachedProducts } from "./cacheService";

// Define a proper interface for global state
interface WindowWithTimers extends Window {
  productsRefreshInterval?: number;
}

declare const window: WindowWithTimers;

let refreshTimer: number | null = null;

export const getProducts = async (forceRefresh = false): Promise<Product[]> => {
  try {
    // Try to get from cache first if not forced refresh
    if (!forceRefresh) {
      const cachedProducts = getCachedProducts();
      if (cachedProducts && cachedProducts.length > 0) {
        console.log('Using cached products');
        return cachedProducts;
      }
    }
    
    console.log('Fetching products from API');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Cast to ensure type safety and validate the data
    const products: Product[] = data.map((item) => ({
      ...item,
      category: item.category as ProductCategory, // Type assertion to ensure category is valid
      gender: item.gender || 'unisex',
      additional_images: item.additional_images || [],
      in_stock: !item.is_sold_out, // For backward compatibility
    }));

    // Store in cache
    setCachedProducts(products);
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    // Cast to ensure type safety
    return {
      ...data,
      category: data.category as ProductCategory, // Type assertion to ensure category is valid
      gender: data.gender || 'unisex',
      additional_images: data.additional_images || [],
      in_stock: !data.is_sold_out, // For backward compatibility
    };
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

export const createProduct = async (product: ProductFormData): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...product,
        category: product.category as ProductCategory, // Type assertion for category
      }])
      .select();

    if (error) {
      throw error;
    }

    // Force refresh the products cache
    await getProducts(true);

    if (!data || data.length === 0) {
      return null;
    }

    return {
      ...data[0],
      category: data[0].category as ProductCategory, // Type assertion to ensure category is valid
      gender: data[0].gender || 'unisex',
      additional_images: data[0].additional_images || [],
      in_stock: !data[0].is_sold_out, // For backward compatibility
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
};

export const updateProduct = async (id: string, product: Partial<ProductFormData>): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...product,
        category: product.category as ProductCategory, // Type assertion for category
      })
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    // Force refresh the products cache
    await getProducts(true);

    if (!data || data.length === 0) {
      return null;
    }

    return {
      ...data[0],
      category: data[0].category as ProductCategory, // Type assertion to ensure category is valid
      gender: data[0].gender || 'unisex',
      additional_images: data[0].additional_images || [],
      in_stock: !data[0].is_sold_out, // For backward compatibility
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Force refresh the products cache
    await getProducts(true);

    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};

export const uploadProductImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrl } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl?.publicUrl || null;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

export const startProductsRefresh = (minutes: number = 30): void => {
  console.log(`Setting up products refresh every ${minutes} minutes`);
  
  // Clear existing timer if any
  stopProductsRefresh();
  
  // Set new timer
  const interval = minutes * 60 * 1000;
  window.productsRefreshInterval = window.setInterval(() => {
    console.log('Auto-refreshing products...');
    getProducts(true).then(() => {
      console.log('Products refreshed successfully');
    });
  }, interval);
};

export const stopProductsRefresh = (): void => {
  if (window.productsRefreshInterval) {
    window.clearInterval(window.productsRefreshInterval);
    delete window.productsRefreshInterval;
    console.log('Products refresh timer stopped');
  }
};
