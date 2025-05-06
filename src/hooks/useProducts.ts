
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { getProducts } from "@/services/productService";

export const useProducts = (forceRefresh = false) => {
  const query = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      return getProducts(forceRefresh);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Add products property to the returned object for backward compatibility
  return {
    ...query,
    products: query.data || [],
  };
};

export default useProducts;
