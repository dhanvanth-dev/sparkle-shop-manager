import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { getCachedData, refreshCachedData } from './cacheService';

const CACHE_KEY_PRODUCTS = 'products';
const CACHE_KEY_FEATURED = 'featured_products';

// Keep track of refresh timers
interface WindowWithTimers extends Window {
  productsRefreshInterval?: NodeJS.Timeout;
}

const windowWithTimers = window as WindowWithTimers;

/**
 * Get all products
 */
export const getProducts = async (forceRefresh = false): Promise<Product[]> => {
  try {
    if (forceRefresh) {
      return await refreshCachedData(CACHE_KEY_PRODUCTS, fetchProductsFromDb);
    }

    return await getCachedData(CACHE_KEY_PRODUCTS, fetchProductsFromDb);
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

/**
 * Fetch fresh product data from the database
 */
const fetchProductsFromDb = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as Product[];
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (forceRefresh = false): Promise<Product[]> => {
  try {
    if (forceRefresh) {
      return await refreshCachedData(CACHE_KEY_FEATURED, fetchFeaturedProductsFromDb);
    }

    return await getCachedData(CACHE_KEY_FEATURED, fetchFeaturedProductsFromDb);
  } catch (error) {
    console.error('Error getting featured products:', error);
    throw error;
  }
};

/**
 * Fetch fresh featured product data from the database
 */
const fetchFeaturedProductsFromDb = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as Product[];
};

/**
 * Get a single product by ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    // First check our local cache
    const products = await getCachedData(CACHE_KEY_PRODUCTS, fetchProductsFromDb);
    const cachedProduct = products.find(p => p.id === id);
    
    if (cachedProduct) {
      return cachedProduct;
    }
    
    // If not in cache, fetch directly
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
    console.error(`Error getting product ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new product
 */
export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Refresh the products cache
  await refreshCachedData(CACHE_KEY_PRODUCTS, fetchProductsFromDb);
  
  return data as Product;
};

/**
 * Update an existing product
 */
export const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Refresh the products cache
  await refreshCachedData(CACHE_KEY_PRODUCTS, fetchProductsFromDb);

  return data as Product;
};

/**
 * Delete a product
 */
export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  // Refresh the products cache
  await refreshCachedData(CACHE_KEY_PRODUCTS, fetchProductsFromDb);
};

/**
 * Start periodic refresh of products data
 * @param minutes How often to refresh data in minutes
 */
export const startProductsRefresh = (minutes: number) => {
  // Clear any existing interval first
  stopProductsRefresh();
  
  // Set up new interval
  const intervalMs = minutes * 60 * 1000;
  
  windowWithTimers.productsRefreshInterval = setInterval(async () => {
    console.log(`[Products] Refreshing product data (${new Date().toLocaleTimeString()})`);
    try {
      await refreshCachedData(CACHE_KEY_PRODUCTS, fetchProductsFromDb);
      await refreshCachedData(CACHE_KEY_FEATURED, fetchFeaturedProductsFromDb);
    } catch (error) {
      console.error('Error during automated product refresh:', error);
    }
  }, intervalMs);
  
  console.log(`[Products] Auto-refresh scheduled every ${minutes} minutes`);
};

/**
 * Stop periodic refresh of products data
 */
export const stopProductsRefresh = () => {
  if (windowWithTimers.productsRefreshInterval) {
    clearInterval(windowWithTimers.productsRefreshInterval);
    windowWithTimers.productsRefreshInterval = undefined;
    console.log('[Products] Auto-refresh stopped');
  }
};
