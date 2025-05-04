
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SavedItem } from '@/types/product';

export const fetchSavedItems = async (userId: string) => {
  try {
    // Fix TypeScript error by using an object parameter
    const { data, error } = await supabase.rpc(
      'get_saved_items_with_products', 
      { user_id: userId }
    );
    
    if (error) {
      console.error('Error fetching saved items:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchSavedItems:', error);
    return [];
  }
};

// Alias for fetchSavedItems to maintain compatibility with existing code
export const getSavedItems = fetchSavedItems;

export const saveItem = async (userId: string, productId: string) => {
  try {
    // Check if the product is already saved
    const { data: existingItems, error: checkError } = await supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId);
    
    if (checkError) {
      console.error('Error checking saved item:', checkError);
      throw checkError;
    }
    
    // If item already exists, don't add it again
    if (existingItems && existingItems.length > 0) {
      toast.info('Item is already in your saved items');
      return true;
    }
    
    // Add new saved item
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
    
    toast.success('Item saved to your favorites');
    return true;
  } catch (error) {
    console.error('Error in saveItem:', error);
    toast.error('Failed to save item');
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
    
    toast.success('Item removed from saved items');
    return true;
  } catch (error) {
    console.error('Error in unsaveItem:', error);
    toast.error('Failed to remove saved item');
    return false;
  }
};

// Alias for unsaveItem to maintain compatibility
export const removeFromSavedItems = unsaveItem;

export const checkIfItemIsSaved = async (userId: string, productId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('saved_items')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking saved status:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in checkIfItemIsSaved:', error);
    return false;
  }
};

// Add the missing moveToCart function
export const moveToCart = async (savedItemId: string, productId: string) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in');
      return false;
    }

    // Check if the item already exists in the cart
    const { data: cartItems, error: checkError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', user.id)
      .eq('product_id', productId);
    
    if (checkError) {
      console.error('Error checking cart:', checkError);
      throw checkError;
    }

    if (cartItems && cartItems.length > 0) {
      // Update existing cart item quantity
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ 
          quantity: cartItems[0].quantity + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartItems[0].id);
      
      if (updateError) {
        console.error('Error updating cart:', updateError);
        throw updateError;
      }
    } else {
      // Add new cart item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({ 
          user_id: user.id,
          product_id: productId,
          quantity: 1
        });
      
      if (insertError) {
        console.error('Error adding to cart:', insertError);
        throw insertError;
      }
    }
    
    // Remove item from saved items
    const { error: removeError } = await supabase
      .from('saved_items')
      .delete()
      .eq('id', savedItemId);
    
    if (removeError) {
      console.error('Error removing from saved items:', removeError);
      throw removeError;
    }
    
    toast.success('Item moved to cart');
    return true;
  } catch (error) {
    console.error('Error in moveToCart:', error);
    toast.error('Failed to move item to cart');
    return false;
  }
};
