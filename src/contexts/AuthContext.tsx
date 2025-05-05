
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Database structure requirements:
  // admins table should have: id (UUID), email (text), created_at (timestamptz)
  // profiles table should have: id (UUID), email (text), created_at (timestamptz), etc.

  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        setUser(session?.user || null);

        if (session?.user) {
          await refreshProfile(session.user.id);
          if (session.user.email) {
            await checkAdminStatus(session.user.email);
          }
        }
      } catch (error) {
        console.error('Session load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      
      if (session?.user) {
        await refreshProfile(session.user.id);
        if (session.user.email) {
          const adminStatus = await checkAdminStatus(session.user.email);
          setIsAdmin(adminStatus);
          
          // Redirect logic
          if (adminStatus && !location.pathname.startsWith('/admin')) {
            navigate('/admin/dashboard');
          } else if (!adminStatus && location.pathname.startsWith('/admin')) {
            navigate('/');
          }
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const checkAdminStatus = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Admin check error:', error);
        return false;
      }
      
      const adminStatus = !!data;
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (error) {
      console.error('Admin check error:', error);
      setIsAdmin(false);
      return false;
    }
  };

  const signIn = async (email?: string, password?: string) => {
    try {
      if (email && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          toast.error('Invalid credentials');
          throw error;
        }
        
        if (data.user?.email) {
          const adminStatus = await checkAdminStatus(data.user.email);
          
          if (adminStatus) {
            navigate('/admin/dashboard');
          } else {
            toast.error('Not authorized as admin');
            await supabase.auth.signOut();
          }
        }
      } else {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      localStorage.clear();
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const refreshProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Profile refresh error:', error);
      setProfile(null);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
