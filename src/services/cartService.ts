
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CartItem } from '@/types/product';

// Cart functions
export async function getCartItems() {
  try {
    // Use rpc call as a workaround for type issues with new tables
    const { data, error } = await supabase
      .rpc('get_cart_items_with_products');

    if (error) {
      // Fall back to direct query with type assertion if rpc fails
      console.error('RPC error, falling back to direct query:', error);
      
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
      console.error('RPC error, falling back to direct query:', checkError);
      
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
          console.error('RPC error, falling back to direct update:', error);
          
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
      console.error('RPC error, falling back to direct insert:', insertError);
      
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
      console.error('RPC error, falling back to direct update:', error);
      
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
      console.error('RPC error, falling back to direct delete:', error);
      
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

// Re-export functions from savedItemsService
export { 
  getSavedItems, 
  addToSavedItems, 
  removeFromSavedItems, 
  moveToCart 
} from './savedItemsService';
