import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/product';
import { toast } from 'sonner';

interface AuthContextProps {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email?: string, password?: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: (userId: string) => Promise<void>;
  checkAdminStatus: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
  
        setUser(session?.user || null);
  
        if (session?.user) {
          await refreshProfile(session.user.id);
          
          // Check if user is an admin
          if (session.user.email) {
            const adminStatus = await checkAdminStatus(session.user.email);
            setIsAdmin(adminStatus);
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        await refreshProfile(session.user.id);
        
        // Check if user is an admin
        if (session.user.email) {
          const adminStatus = await checkAdminStatus(session.user.email);
          setIsAdmin(adminStatus);
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email?: string, password?: string) => {
    if (email && password) {
      // Email/password sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
    } else {
      // OAuth sign in with Google
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) throw error;
  };
  
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear user state
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
      // Clear all auth-related items from local storage
      // This is a more thorough approach to ensure complete logout
      const keysToRemove = [
        'supabase.auth.token',
        'supabase.auth.expires_at',
        'supabase.auth.refresh_token',
        'sb-hgdcneupkjiidjahpszh-auth-token',
        'supabase.auth.callback_url'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Also clear all items that start with 'supabase.auth.'
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error('Failed to log out');
    }
  };

  const refreshProfile = async (id: string) => {
    try {
      const { data, error } = await supabase.rpc(
        'get_profile_by_id', 
        { user_id: id }
      ) as any;

      // Check if data exists and is an array with entries
      if (data && Array.isArray(data) && data.length > 0) {
        setProfile(data[0]);
      } else {
        console.error('No profile data found or error:', error);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  // Check if the user is an admin by querying the admins table
  const checkAdminStatus = async (email: string): Promise<boolean> => {
    try {
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();
      
      if (adminError || !adminData) {
        console.log('User is not an admin');
        return false;
      }
      
      console.log('User is an admin');
      return true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  const value: AuthContextProps = {
    user,
    profile,
    loading,
    isAdmin,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshProfile,
    checkAdminStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
