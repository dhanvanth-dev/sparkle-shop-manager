import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { getCachedProducts, setCachedProducts } from "./cacheService";

// Define a proper interface for global state
interface WindowWithTimers extends Window {
  productsRefreshInterval?: number;
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
  windowWithTimers.productsRefreshInterval = window.setInterval(() => {
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

// Add the missing uploadProductImage function
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

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
