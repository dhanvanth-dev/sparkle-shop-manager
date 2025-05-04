
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CartItem, Product } from '@/types/product';

export const fetchCartItems = async (userId: string) => {
  try {
    // Fix TypeScript error by using an object parameter
    const { data, error } = await supabase.rpc(
      'get_cart_items_with_products', 
      { user_id: userId }
    );
    
    if (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchCartItems:', error);
    return [];
  }
};

// Alias for fetchCartItems to maintain compatibility with existing code
export const getCartItems = fetchCartItems;

export const addToCart = async (userId: string, productId: string) => {
  try {
    // Check if the item already exists in the cart
    const { data: existingItems, error: checkError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId);
    
    if (checkError) {
      console.error('Error checking cart item:', checkError);
      throw checkError;
    }
    
    if (existingItems && existingItems.length > 0) {
      // Item exists, update quantity
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ 
          quantity: existingItems[0].quantity + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItems[0].id);
      
      if (updateError) {
        console.error('Error updating cart item:', updateError);
        throw updateError;
      }
      
      toast.success('Item quantity updated in cart');
    } else {
      // Item doesn't exist, add new item
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({ 
          user_id: userId, 
          product_id: productId,
          quantity: 1
        });
      
      if (insertError) {
        console.error('Error adding item to cart:', insertError);
        throw insertError;
      }
      
      toast.success('Item added to cart');
    }
    
    return true;
  } catch (error) {
    console.error('Error in addToCart:', error);
    toast.error('Failed to add item to cart');
    return false;
  }
};

export const updateCartItemQuantity = async (itemId: string, quantity: number) => {
  try {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      
      if (error) {
        console.error('Error removing cart item:', error);
        throw error;
      }
      
      toast.success('Item removed from cart');
      return true;
    }
    
    // Update quantity
    const { error } = await supabase
      .from('cart_items')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);
    
    if (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateCartItemQuantity:', error);
    toast.error('Failed to update cart');
    return false;
  }
};

export const removeFromCart = async (itemId: string) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);
    
    if (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
    
    toast.success('Item removed from cart');
    return true;
  } catch (error) {
    console.error('Error in removeFromCart:', error);
    toast.error('Failed to remove item from cart');
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
    
    return true;
  } catch (error) {
    console.error('Error in clearCart:', error);
    return false;
  }
};

export const getCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
};

export const getCartItemsCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

// Add the missing moveToSavedItems function
export const moveToSavedItems = async (cartItemId: string, productId: string) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in');
      return false;
    }

    // Save item to saved_items table
    const { error: saveError } = await supabase
      .from('saved_items')
      .insert({ 
        user_id: user.id,
        product_id: productId
      });
    
    if (saveError) {
      console.error('Error saving item:', saveError);
      throw saveError;
    }
    
    // Remove item from cart
    const { error: removeError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);
    
    if (removeError) {
      console.error('Error removing item from cart:', removeError);
      throw removeError;
    }
    
    return true;
  } catch (error) {
    console.error('Error in moveToSavedItems:', error);
    toast.error('Failed to save item for later');
    return false;
  }
};
