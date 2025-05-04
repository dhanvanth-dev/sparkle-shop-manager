
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
