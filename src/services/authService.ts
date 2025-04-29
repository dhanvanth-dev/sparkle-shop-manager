
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error logging in:', error);
    toast.error(error.message);
    return null;
  }

  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error logging out:', error);
    toast.error(error.message);
    return false;
  }

  return true;
}

export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
