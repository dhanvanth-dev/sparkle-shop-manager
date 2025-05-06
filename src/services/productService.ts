
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductCategory, ProductGender, ProductFormData } from "@/types/product";

// Define a proper interface for global state
interface WindowWithCache extends Window {
  cachedProducts: Product[] | null;
  lastFetchTime: number | null;
  productsRefreshTimeout: number | null;
}

declare const window: WindowWithCache;

// Initialize cache
if (typeof window !== "undefined") {
  window.cachedProducts = window.cachedProducts || null;
  window.lastFetchTime = window.lastFetchTime || null;
  window.productsRefreshTimeout = window.productsRefreshTimeout || null;
}

// Refresh cache after 5 minutes
const CACHE_EXPIRY = 1000 * 60 * 5;

export const getProducts = async (): Promise<Product[]> => {
  // Check if we have cached products and if they're still fresh
  if (
    typeof window !== "undefined" &&
    window.cachedProducts &&
    window.lastFetchTime &&
    Date.now() - window.lastFetchTime < CACHE_EXPIRY
  ) {
    return window.cachedProducts;
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Ensure the data conforms to the Product type
    const validatedProducts: Product[] = data.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category as ProductCategory,
      gender: item.gender as ProductGender,
      description: item.description,
      image_url: item.image_url,
      additional_images: item.additional_images || [],
      video_url: item.video_url,
      is_new_arrival: item.is_new_arrival,
      is_sold_out: item.is_sold_out,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));

    // Update cache
    if (typeof window !== "undefined") {
      window.cachedProducts = validatedProducts;
      window.lastFetchTime = Date.now();
    }

    return validatedProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    // Ensure the data conforms to the Product type
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      category: data.category as ProductCategory,
      gender: data.gender as ProductGender,
      description: data.description,
      image_url: data.image_url,
      additional_images: data.additional_images || [],
      video_url: data.video_url,
      is_new_arrival: data.is_new_arrival,
      is_sold_out: data.is_sold_out,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }
};

export const createProduct = async (productData: ProductFormData): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Ensure the data conforms to the Product type
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      category: data.category as ProductCategory,
      gender: data.gender as ProductGender,
      description: data.description,
      image_url: data.image_url,
      additional_images: data.additional_images || [],
      video_url: data.video_url,
      is_new_arrival: data.is_new_arrival,
      is_sold_out: data.is_sold_out,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error("Error creating product:", error);
    return null;
  }
};

export const updateProduct = async (id: string, productData: Partial<ProductFormData>): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Ensure the data conforms to the Product type
    return {
      id: data.id,
      name: data.name,
      price: data.price,
      category: data.category as ProductCategory,
      gender: data.gender as ProductGender,
      description: data.description,
      image_url: data.image_url,
      additional_images: data.additional_images || [],
      video_url: data.video_url,
      is_new_arrival: data.is_new_arrival,
      is_sold_out: data.is_sold_out,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      throw error;
    }

    // Clear the cache to ensure it's refreshed on next fetch
    if (typeof window !== "undefined") {
      window.cachedProducts = null;
      window.lastFetchTime = null;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    return false;
  }
};

export const uploadProductImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Force a refresh of the products cache
export const refreshProductsCache = (): void => {
  if (typeof window !== "undefined") {
    window.cachedProducts = null;
    window.lastFetchTime = null;
    // Call getProducts to refresh the cache
    getProducts();
  }
};
