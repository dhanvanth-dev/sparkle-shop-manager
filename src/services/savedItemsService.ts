
import { supabase } from '@/integrations/supabase/client';
import { addToCart } from './cartService';
import { toast } from 'sonner';

export const getSavedItems = async (userId: string) => {
  try {
    // Using a direct query instead of RPC to fix TypeScript error
    const { data, error } = await supabase
      .from('saved_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching saved items:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getSavedItems:', error);
    return [];
  }
};

// Create alias for compatibility with SavedItems.tsx
export const fetchSavedItems = getSavedItems;

export const saveItem = async (userId: string, productId: string) => {
  try {
    // Check if already saved
    const { data: existingItems, error: checkError } = await supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (checkError) {
      console.error('Error checking saved items:', checkError);
      throw checkError;
    }

    if (existingItems && existingItems.length > 0) {
      toast.info('Item already saved');
      return true;
    }

    // Save new item
    const { error: insertError } = await supabase
      .from('saved_items')
      .insert({
        user_id: userId,
        product_id: productId
      });

    if (insertError) {
      console.error('Error saving item:', insertError);
      throw insertError;
    }

    toast.success('Item saved for later');
    return true;
  } catch (error) {
    console.error('Error in saveItem:', error);
    toast.error('Failed to save item');
    return false;
  }
};

export const checkIfItemIsSaved = async (userId: string, productId: string) => {
  try {
    const { data, error } = await supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) {
      console.error('Error checking saved status:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkIfItemIsSaved:', error);
    return false;
  }
};

export const unsaveItem = async (itemId: string) => {
  try {
    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error removing saved item:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in unsaveItem:', error);
    return false;
  }
};

// Add removeFromSavedItems as alias for unsaveItem for compatibility
export const removeFromSavedItems = unsaveItem;

export const moveToCart = async (userId: string, savedItemId: string, productId: string) => {
  try {
    // First add to cart
    const addSuccess = await addToCart(userId, productId);
    
    if (addSuccess) {
      // Then remove from saved items
      const removeSuccess = await unsaveItem(savedItemId);
      
      if (removeSuccess) {
        toast.success('Item moved to cart');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error moving item to cart:', error);
    toast.error('Failed to move item');
    return false;
  }
};
