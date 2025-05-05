
/**
 * Service to handle caching and periodic refresh of data
 */

// Constants
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// Type for cache items
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Get data from cache or fetch it if needed
 * @param cacheKey Cache key identifier
 * @param fetchFn Function to fetch data if cache is invalid
 */
export async function getCachedData<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  try {
    // Try to get from cache first
    const cachedItem = getCacheItem<T>(cacheKey);
    
    if (cachedItem && !isCacheExpired(cachedItem.timestamp)) {
      console.log(`[Cache] Using cached data for ${cacheKey}`);
      return cachedItem.data;
    }
    
    // If no valid cache, fetch fresh data
    console.log(`[Cache] Fetching fresh data for ${cacheKey}`);
    const freshData = await fetchFn();
    
    // Store in cache
    setCacheItem<T>(cacheKey, freshData);
    
    return freshData;
  } catch (error) {
    console.error(`[Cache] Error getting cached data for ${cacheKey}:`, error);
    
    // If fetch fails but we have cached data (even if expired), use it as fallback
    const cachedItem = getCacheItem<T>(cacheKey);
    if (cachedItem) {
      console.log(`[Cache] Using expired cache as fallback for ${cacheKey}`);
      return cachedItem.data;
    }
    
    throw error;
  }
}

/**
 * Force refresh of cached data
 * @param cacheKey Cache key identifier
 * @param fetchFn Function to fetch fresh data
 */
export async function refreshCachedData<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  try {
    const freshData = await fetchFn();
    setCacheItem<T>(cacheKey, freshData);
    return freshData;
  } catch (error) {
    console.error(`[Cache] Error refreshing data for ${cacheKey}:`, error);
    throw error;
  }
}

/**
 * Clear specific cache item
 * @param cacheKey Cache key to clear
 */
export function clearCacheItem(cacheKey: string): void {
  localStorage.removeItem(`cache_${cacheKey}`);
}

/**
 * Clear all cache items
 */
export function clearAllCache(): void {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('cache_')) {
      localStorage.removeItem(key);
    }
  });
}

// Helper functions
function getCacheItem<T>(key: string): CacheItem<T> | null {
  const item = localStorage.getItem(`cache_${key}`);
  return item ? JSON.parse(item) : null;
}

function setCacheItem<T>(key: string, data: T): void {
  const cacheItem: CacheItem<T> = {
    data,
    timestamp: Date.now(),
  };
  localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
}

function isCacheExpired(timestamp: number): boolean {
  return Date.now() - timestamp > CACHE_DURATION_MS;
}
