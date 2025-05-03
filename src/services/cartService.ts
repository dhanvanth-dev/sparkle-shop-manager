
import { supabase } from '@/integrations/supabase/client';
import { CartItem, Product } from '@/types/product';
import { toast } from 'sonner';

/**
 * Get all items in the cart for the current user
 */
export const getCartItems = async (): Promise<CartItem[]> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user?.user) return [];

  try {
    // Create a properly typed parameter object (even if empty)
    const params: Record<string, any> = {};
    
    // Use the typed parameter object with the RPC call
    const { data, error } = await supabase.rpc(
      'get_cart_items_with_products',
      params
    ) as any;

    if (error || !data) {
      console.error('Error fetching cart items:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getCartItems:', error);
    return [];
  }
};

/**
 * Add a product to the cart
 */
export const addToCart = async (productId: string): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) return false;

  try {
    // Check if product is already in cart
    const { data: existingItems } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('product_id', productId) as any;

    if (existingItems?.length > 0) {
      // Update quantity if already in cart
      const currentQuantity = existingItems[0].quantity || 0;
      
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: currentQuantity + 1 })
        .eq('id', existingItems[0].id) as any;

      return !error;
    } else {
      // Add new item to cart
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.user.id,
          product_id: productId,
          quantity: 1
        }) as any;

      return !error;
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    toast.error('Failed to add item to cart');
    return false;
  }
};

/**
 * Update the quantity of an item in the cart
 */
export const updateCartItemQuantity = async (itemId: string, quantity: number): Promise<boolean> => {
  if (quantity < 1) {
    return removeFromCart(itemId);
  }

  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) return false;

  try {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .eq('user_id', user.user.id) as any;

    return !error;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return false;
  }
};

/**
 * Remove an item from the cart
 */
export const removeFromCart = async (itemId: string): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) return false;

  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.user.id) as any;

    return !error;
  } catch (error) {
    console.error('Error removing from cart:', error);
    return false;
  }
};

/**
 * Clear the cart
 */
export const clearCart = async (): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) return false;

  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.user.id) as any;

    return !error;
  } catch (error) {
    console.error('Error clearing cart:', error);
    return false;
  }
};

/**
 * Move an item from cart to saved items
 */
export const moveToSavedItems = async (itemId: string, productId: string): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) return false;
  
  try {
    // Create a saved item
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90); // Save for 90 days

    const { error: saveError } = await supabase
      .from('saved_items')
      .insert({
        user_id: user.user.id,
        product_id: productId,
        expires_at: expiryDate.toISOString()
      }) as any;

    if (saveError) {
      console.error('Error moving item to saved items:', saveError);
      return false;
    }

    // Remove from cart
    return await removeFromCart(itemId);
  } catch (error) {
    console.error('Error moving item to saved items:', error);
    return false;
  }
};
