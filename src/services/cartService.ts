
import { supabase } from '@/integrations/supabase/client';
import { CartItem, Product } from '@/types/product';

/**
 * Get all items in the cart for the current user
 */
export const getCartItems = async (): Promise<CartItem[]> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user?.user) return [];

  // First try using the RPC function (typesafe approach)
  const { data, error } = await supabase.rpc('get_cart_items_with_products', {
    user_id: user.user.id
  }) as any;

  if (error || !data) {
    console.error('Error fetching cart items:', error);
    return [];
  }

  return data;
};

/**
 * Add a product to the cart
 */
export const addToCart = async (productId: string): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) return false;

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

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .eq('user_id', user.user.id) as any;

  return !error;
};

/**
 * Remove an item from the cart
 */
export const removeFromCart = async (itemId: string): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) return false;

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.user.id) as any;

  return !error;
};

/**
 * Clear the cart
 */
export const clearCart = async (): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) return false;

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.user.id) as any;

  return !error;
};

/**
 * Move an item from cart to saved items
 */
export const moveToSavedItems = async (itemId: string, productId: string): Promise<boolean> => {
  const { data: user } = await supabase.auth.getUser();

  if (!user?.user) return false;
  
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
};
