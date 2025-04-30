
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Product, CartItem, SavedItem } from '@/types/product';

// Cart functions
export async function getCartItems() {
  try {
    // Use rpc call as a workaround for type issues with new tables
    const { data, error } = await supabase
      .rpc('get_cart_items_with_products');

    if (error) {
      // Fall back to direct query with type assertion if rpc fails
      const { data: cartData, error: cartError } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .order('created_at', { ascending: false });

      if (cartError) throw cartError;
      return cartData as unknown as CartItem[];
    }

    return data as unknown as CartItem[];
  } catch (error: any) {
    console.error('Error fetching cart items:', error);
    toast.error(error.message || 'Failed to load cart items');
    return [];
  }
}

export async function addToCart(productId: string, quantity = 1) {
  try {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      toast.error('Please sign in to add items to your cart');
      throw new Error('Authentication required');
    }

    // Check if item is already in cart
    const { data: existingItem, error: checkError } = await supabase
      .rpc('get_cart_item', { product_id_param: productId });

    if (checkError) {
      // Fall back to direct query with type assertion if rpc fails
      const { data: cartItem, error: cartError } = await supabase
        .from('cart_items')
        .select()
        .eq('product_id', productId)
        .single();

      if (cartError && cartError.code !== 'PGRST116') throw cartError; // Not found error is ok
      
      if (cartItem) {
        // Update quantity
        const { error } = await supabase
          .rpc('update_cart_item_quantity', {
            cart_item_id: cartItem.id,
            new_quantity: Math.min((cartItem as unknown as CartItem).quantity + quantity, 10)
          });

        if (error) {
          // Fall back to direct update with type assertion if rpc fails
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({
              quantity: Math.min((cartItem as unknown as CartItem).quantity + quantity, 10),
              updated_at: new Date().toISOString()
            } as any)
            .eq('id', cartItem.id);

          if (updateError) throw updateError;
        }
        
        toast.success('Cart updated successfully');
        return true;
      }
    } else if (existingItem) {
      // Update quantity using RPC
      const { error } = await supabase
        .rpc('update_cart_item_quantity', {
          cart_item_id: existingItem.id,
          new_quantity: Math.min(existingItem.quantity + quantity, 10)
        });

      if (error) throw error;
      
      toast.success('Cart updated successfully');
      return true;
    }

    // Add new item
    const { error: insertError } = await supabase
      .rpc('add_to_cart', {
        product_id_param: productId,
        quantity_param: quantity
      });

    if (insertError) {
      // Fall back to direct insert with type assertion if rpc fails
      const { error } = await supabase
        .from('cart_items')
        .insert({
          product_id: productId,
          quantity,
        } as any);

      if (error) throw error;
    }
    
    toast.success('Item added to cart');
    return true;
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    toast.error(error.message || 'Failed to add item to cart');
    return false;
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  try {
    if (quantity < 1 || quantity > 10) {
      toast.error('Quantity must be between 1 and 10');
      return false;
    }

    // Use rpc call as a workaround for type issues with new tables
    const { error } = await supabase
      .rpc('update_cart_item_quantity', {
        cart_item_id: cartItemId,
        new_quantity: quantity
      });

    if (error) {
      // Fall back to direct update with type assertion if rpc fails
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ 
          quantity, 
          updated_at: new Date().toISOString() 
        } as any)
        .eq('id', cartItemId);

      if (updateError) throw updateError;
    }
    
    return true;
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    toast.error(error.message || 'Failed to update item quantity');
    return false;
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    // Use rpc call as a workaround for type issues with new tables
    const { error } = await supabase
      .rpc('remove_from_cart', {
        cart_item_id: cartItemId
      });

    if (error) {
      // Fall back to direct delete with type assertion if rpc fails
      const { error: deleteError } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (deleteError) throw deleteError;
    }
    
    toast.success('Item removed from cart');
    return true;
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    toast.error(error.message || 'Failed to remove item from cart');
    return false;
  }
}

// Saved items functions
export async function getSavedItems() {
  try {
    // Use rpc call as a workaround for type issues with new tables
    const { data, error } = await supabase
      .rpc('get_saved_items_with_products');

    if (error) {
      // Fall back to direct query with type assertion if rpc fails
      const { data: savedData, error: savedError } = await supabase
        .from('saved_items')
        .select(`
          *,
          product:products(*)
        `)
        .order('created_at', { ascending: false });

      if (savedError) throw savedError;
      return savedData as unknown as SavedItem[];
    }

    return data as unknown as SavedItem[];
  } catch (error: any) {
    console.error('Error fetching saved items:', error);
    toast.error(error.message || 'Failed to load saved items');
    return [];
  }
}

export async function addToSavedItems(productId: string) {
  try {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      toast.error('Please sign in to save items');
      throw new Error('Authentication required');
    }

    // Use rpc call as a workaround for type issues with new tables
    const { data: existingItem, error: checkError } = await supabase
      .rpc('get_saved_item', { product_id_param: productId });

    if (checkError) {
      // Fall back to direct query with type assertion if rpc fails
      const { data: savedItem, error: savedError } = await supabase
        .from('saved_items')
        .select()
        .eq('product_id', productId)
        .single();

      if (savedError && savedError.code !== 'PGRST116') throw savedError; // Not found error is ok

      if (savedItem) {
        toast.info('Item is already in your saved items');
        return true;
      }
    } else if (existingItem) {
      toast.info('Item is already in your saved items');
      return true;
    }

    // Add new item
    const { error: insertError } = await supabase
      .rpc('add_to_saved_items', {
        product_id_param: productId
      });

    if (insertError) {
      // Fall back to direct insert with type assertion if rpc fails
      const { error } = await supabase
        .from('saved_items')
        .insert({
          product_id: productId,
        } as any);

      if (error) throw error;
    }
    
    toast.success('Item saved for later');
    return true;
  } catch (error: any) {
    console.error('Error saving item:', error);
    toast.error(error.message || 'Failed to save item');
    return false;
  }
}

export async function removeFromSavedItems(savedItemId: string) {
  try {
    // Use rpc call as a workaround for type issues with new tables
    const { error } = await supabase
      .rpc('remove_from_saved_items', {
        saved_item_id: savedItemId
      });

    if (error) {
      // Fall back to direct delete with type assertion if rpc fails
      const { error: deleteError } = await supabase
        .from('saved_items')
        .delete()
        .eq('id', savedItemId);

      if (deleteError) throw deleteError;
    }
    
    toast.success('Item removed from saved items');
    return true;
  } catch (error: any) {
    console.error('Error removing saved item:', error);
    toast.error(error.message || 'Failed to remove saved item');
    return false;
  }
}

export async function moveToCart(savedItemId: string, productId: string) {
  try {
    // Add to cart first
    const added = await addToCart(productId);
    
    if (added) {
      // Then remove from saved items
      await removeFromSavedItems(savedItemId);
      toast.success('Item moved to cart');
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.error('Error moving item to cart:', error);
    toast.error(error.message || 'Failed to move item to cart');
    return false;
  }
}
