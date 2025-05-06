
import { Product } from '@/types/product';

const PRODUCTS_CACHE_KEY = 'saaral_products_cache';
const PRODUCTS_CACHE_TIMESTAMP_KEY = 'saaral_products_cache_timestamp';
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

export const getCachedProducts = (): Product[] | null => {
  try {
    const timestamp = localStorage.getItem(PRODUCTS_CACHE_TIMESTAMP_KEY);
    const cachedData = localStorage.getItem(PRODUCTS_CACHE_KEY);
    
    if (!timestamp || !cachedData) {
      return null;
    }
    
    const now = new Date().getTime();
    const storedTime = parseInt(timestamp, 10);
    
    // Return null if cache is expired
    if (now - storedTime > CACHE_TTL) {
      console.log('Cache expired');
      return null;
    }
    
    return JSON.parse(cachedData) as Product[];
  } catch (error) {
    console.error('Error retrieving product cache:', error);
    return null;
  }
};

export const setCachedProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products));
    localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP_KEY, new Date().getTime().toString());
  } catch (error) {
    console.error('Error setting product cache:', error);
  }
};

export const clearCache = (): void => {
  try {
    localStorage.removeItem(PRODUCTS_CACHE_KEY);
    localStorage.removeItem(PRODUCTS_CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};
