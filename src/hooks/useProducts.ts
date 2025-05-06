
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getProducts } from '@/services/productService';

export const useProducts = () => {
  const queryClient = useQueryClient();
  
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 0, // Set to 0 to refetch on each mount
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    // Force refetch on component mount to ensure fresh data
    refetch();
    
    // Also invalidate the query cache on mount to force a refetch
    queryClient.invalidateQueries({ queryKey: ['products'] });
  }, [refetch, queryClient]);

  return {
    products: products || [],
    isLoading,
    error,
    refetch,
    refreshProducts: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  };
};
