import { supabase } from '@/integrations/supabase/client';
import { SavedItem } from '@/types/product';
import { addToCart } from './cartService';
import { toast } from 'sonner';

/**
 * Get all saved items for the current user
 */
export const getSavedItems = async (): Promise<SavedItem[]> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user?.user) return [];

  try {
    const { data, error } = await supabase.rpc('get_saved_items_with_products', {});

    if (error || !data) {
      console.error('Error fetching saved items:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getSavedItems:', error);
    return [];
  }
};

/**
 * Add a product to saved items
 */
export const addToSavedItems = async (productId: string): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) return false;

  try {
    // Check if product is already saved
    const { data: existingItems } = await supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('product_id', productId) as any;

    if (existingItems?.length > 0) {
      // Already saved - update expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 90); // Save for 90 days
      
      const { error } = await supabase
        .from('saved_items')
        .update({ expires_at: expiryDate.toISOString() })
        .eq('id', existingItems[0].id) as any;

      return !error;
    } else {
      // Add new saved item
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 90); // Save for 90 days
      
      const { error } = await supabase
        .from('saved_items')
        .insert({
          user_id: user.user.id,
          product_id: productId,
          expires_at: expiryDate.toISOString()
        }) as any;

      return !error;
    }
  } catch (error) {
    console.error('Error adding to saved items:', error);
    toast.error('Failed to save item');
    return false;
  }
};

/**
 * Remove an item from saved items
 */
export const removeFromSavedItems = async (itemId: string): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) return false;

  try {
    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.user.id) as any;

    return !error;
  } catch (error) {
    console.error('Error removing saved item:', error);
    return false;
  }
};

/**
 * Move an item from saved items to cart
 */
export const moveToCart = async (itemId: string, productId: string): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user?.user) return false;

  try {
    // Add to cart first
    const addSuccess = await addToCart(productId);
    
    if (!addSuccess) {
      return false;
    }
    
    // Then remove from saved items
    return await removeFromSavedItems(itemId);
  } catch (error) {
    console.error('Error moving item to cart:', error);
    toast.error('Failed to move item to cart');
    return false;
  }
};
