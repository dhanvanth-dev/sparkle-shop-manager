
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SavedItem } from '@/types/product';
import { addToCart, removeFromCart } from './cartService';

// Saved items functions
export async function getSavedItems() {
  try {
    // Use rpc call as a workaround for type issues with new tables
    const { data, error } = await supabase
      .rpc('get_saved_items_with_products');

    if (error) {
      // Fall back to direct query with type assertion if rpc fails
      console.error('RPC error, falling back to direct query:', error);
      
      const { data: savedData, error: savedError } = await supabase
        .from('saved_items' as any)
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
      console.error('RPC error, falling back to direct query:', checkError);
      
      const { data: savedItem, error: savedError } = await supabase
        .from('saved_items' as any)
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
      console.error('RPC error, falling back to direct insert:', insertError);
      
      const { error } = await supabase
        .from('saved_items' as any)
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
      console.error('RPC error, falling back to direct delete:', error);
      
      const { error: deleteError } = await supabase
        .from('saved_items' as any)
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
