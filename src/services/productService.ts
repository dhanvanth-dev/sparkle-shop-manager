
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductFormData } from "@/types/product";
import { getCachedData, getCachedProducts, setCachedProducts } from "./cacheService";

// Define a proper interface for global state
interface WindowWithTimers extends Window {
  productsRefreshInterval?: ReturnType<typeof setInterval>;
}

const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

// Get reference to window with the correct type
const windowWithTimers = window as unknown as WindowWithTimers;

export const startProductsRefresh = (intervalMinutes: number) => {
  // Clear any existing interval
  if (windowWithTimers.productsRefreshInterval) {
    clearInterval(windowWithTimers.productsRefreshInterval);
  }

  // Set new interval
  windowWithTimers.productsRefreshInterval = setInterval(() => {
    console.log('Refreshing products from scheduled interval');
    getProducts(true).catch(console.error);
  }, intervalMinutes * 60 * 1000);

  return () => {
    if (windowWithTimers.productsRefreshInterval) {
      clearInterval(windowWithTimers.productsRefreshInterval);
      delete windowWithTimers.productsRefreshInterval;
    }
  };
};

export const stopProductsRefresh = () => {
  if (windowWithTimers.productsRefreshInterval) {
    clearInterval(windowWithTimers.productsRefreshInterval);
    delete windowWithTimers.productsRefreshInterval;
  }
};

// Add the uploadProductImage function
export const uploadProductImage = async (file: File): Promise<string> => {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data: publicUrl } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw error;
  }
};

export const getProducts = async (forceRefresh = false): Promise<Product[]> => {
  try {
    // Try to get from cache if not forcing refresh
    if (!forceRefresh) {
      const cachedData = getCachedProducts();
      if (cachedData) {
        console.log('Using cached products data');
        return cachedData;
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

    // Cache the new data
    setCachedProducts(data as Product[], CACHE_EXPIRY);
    
    return data as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    // On error, return cached data if available
    const cachedData = getCachedProducts();
    if (cachedData) {
      return cachedData;
    }
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data as Product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

export const createProduct = async (product: ProductFormData): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Clear cache to ensure fresh data on next fetch
    setCachedProducts(null);

    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, product: ProductFormData): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Clear cache to ensure fresh data on next fetch
    setCachedProducts(null);

    return data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    
    // Clear cache to ensure fresh data on next fetch
    setCachedProducts(null);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
