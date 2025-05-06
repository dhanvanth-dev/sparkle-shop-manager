
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { getProducts } from "@/services/productService";

export const useProducts = (forceRefresh = false) => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      return getProducts(forceRefresh);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

export default useProducts;
