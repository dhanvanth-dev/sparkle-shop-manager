
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getProducts } from '@/services/productService';

export const useProducts = () => {
  const queryClient = useQueryClient();
  
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Force refetch on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    products: products || [],
    isLoading,
    error,
    refetch,
    refreshProducts: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  };
};
