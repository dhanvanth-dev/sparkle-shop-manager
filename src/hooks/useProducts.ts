
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/services/productService';
import { Product } from '@/types/product';

export const useProducts = () => {
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    // Force refetch on component mount to ensure fresh data
    refetch();
  }, [refetch]);

  return {
    products: products || [],
    isLoading,
    error,
    refetch
  };
};
