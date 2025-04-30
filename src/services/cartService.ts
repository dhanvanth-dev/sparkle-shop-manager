
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Product } from '@/types/product';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: Product;
}

export interface SavedItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  expires_at: string;
  product: Product;
}

// Cart functions
export async function getCartItems() {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as CartItem[];
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
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select()
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: Math.min(existingItem.quantity + quantity, 10), // Enforce max quantity 
          updated_at: new Date().toISOString() 
        })
        .eq('id', existingItem.id);

      if (error) throw error;
      
      toast.success('Cart updated successfully');
      return true;
    } else {
      // Add new item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          product_id: productId,
          quantity,
        });

      if (error) throw error;
      
      toast.success('Item added to cart');
      return true;
    }
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

    const { error } = await supabase
      .from('cart_items')
      .update({ 
        quantity, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', cartItemId);

    if (error) throw error;
    
    return true;
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    toast.error(error.message || 'Failed to update item quantity');
    return false;
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
    
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
    const { data, error } = await supabase
      .from('saved_items')
      .select(`
        *,
        product:products(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as SavedItem[];
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

    // Check if item is already saved
    const { data: existingItem } = await supabase
      .from('saved_items')
      .select()
      .eq('product_id', productId)
      .single();

    if (existingItem) {
      toast.info('Item is already in your saved items');
      return true;
    }

    const { error } = await supabase
      .from('saved_items')
      .insert({
        product_id: productId,
      });

    if (error) throw error;
    
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
    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('id', savedItemId);

    if (error) throw error;
    
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
