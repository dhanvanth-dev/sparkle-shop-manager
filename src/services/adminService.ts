
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Create a test admin account if it doesn't exist
 */
export const createTestAdmin = async (): Promise<{email: string, password: string} | null> => {
  try {
    const testAdmin = {
      email: 'admin@example.com',
      password: 'admin123'
    };
    
    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', testAdmin.email)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking for existing admin:', checkError);
      return null;
    }
    
    // If admin doesn't exist, create it
    if (!existingAdmin) {
      const { error } = await supabase
        .from('admins')
        .insert({
          email: testAdmin.email,
          password: testAdmin.password,
        });
        
      if (error) {
        console.error('Error creating test admin:', error);
        return null;
      }
      
      toast.success('Test admin account created');
    } else {
      toast.info('Test admin account already exists');
    }
    
    return testAdmin;
  } catch (error) {
    console.error('Error in createTestAdmin:', error);
    return null;
  }
};

/**
 * Check if user is an admin
 */
export const verifyAdminStatus = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .maybeSingle();
      
    if (error) {
      console.error('Error verifying admin status:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error in verifyAdminStatus:', error);
    return false;
  }
};
