
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CartItem } from '@/types/product';
import { saveItem } from './savedItemsService';

export const fetchCartItems = async (userId: string) => {
  try {
    // Using a direct query instead of RPC to fix TypeScript error
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }
    
    return data as CartItem[] || [];
  } catch (error) {
    console.error('Error in fetchCartItems:', error);
    return [];
  }
};

// Create an alias for the fetchCartItems function for compatibility
export const getCartItems = fetchCartItems;

export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  try {
    // Check if product already in cart
    const { data: existingItems, error: checkError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId);
    
    if (checkError) {
      console.error('Error checking cart:', checkError);
      throw checkError;
    }
    
    if (existingItems && existingItems.length > 0) {
      // Update quantity
      const newQuantity = existingItems[0].quantity + quantity;
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString() 
        })
        .eq('id', existingItems[0].id);
        
      if (updateError) {
        console.error('Error updating cart:', updateError);
        throw updateError;
      }
      
      toast.success('Cart updated');
    } else {
      // Add new item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity: quantity
        });
        
      if (insertError) {
        console.error('Error adding to cart:', insertError);
        throw insertError;
      }
      
      toast.success('Product added to cart');
    }
    
    return true;
  } catch (error) {
    console.error('Error in addToCart:', error);
    toast.error('Failed to update cart');
    return false;
  }
};

export const updateCartItemQuantity = async (itemId: string, quantity: number) => {
  try {
    if (quantity < 1) {
      return removeCartItem(itemId);
    }
    
    const { error } = await supabase
      .from('cart_items')
      .update({ 
        quantity: quantity,
        updated_at: new Date().toISOString() 
      })
      .eq('id', itemId);
      
    if (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
    
    toast.success('Cart updated');
    return true;
  } catch (error) {
    console.error('Error in updateCartItemQuantity:', error);
    toast.error('Failed to update quantity');
    return false;
  }
};

export const removeCartItem = async (itemId: string) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);
      
    if (error) {
      console.error('Error removing item:', error);
      throw error;
    }
    
    toast.success('Item removed from cart');
    return true;
  } catch (error) {
    console.error('Error in removeCartItem:', error);
    toast.error('Failed to remove item');
    return false;
  }
};

// Alias for compatibility with Cart.tsx
export const removeFromCart = removeCartItem;

export const moveToSavedItems = async (userId: string, cartItemId: string, productId: string) => {
  try {
    // First save the item
    const savedSuccess = await saveItem(userId, productId);
    
    if (savedSuccess) {
      // Then remove from cart
      const removeSuccess = await removeCartItem(cartItemId);
      
      if (removeSuccess) {
        toast.success('Item moved to saved items');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error moving item to saved:', error);
    toast.error('Failed to move item');
    return false;
  }
};

export const clearCart = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
    
    toast.success('Cart cleared');
    return true;
  } catch (error) {
    console.error('Error in clearCart:', error);
    toast.error('Failed to clear cart');
    return false;
  }
};
