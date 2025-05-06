
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
  checkAdminStatus: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Initial session load - User is logged in:", session.user.email);
          setUser(session.user);
          await refreshProfile(session.user.id);
          
          if (session.user.email) {
            const adminStatus = await checkAdminStatus(session.user.email);
            console.log("Admin status check:", adminStatus);
            setIsAdmin(adminStatus);
          }
        } else {
          console.log("No active session found");
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Session load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        // Clear all user data on sign out
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        console.log('User signed out, state cleared');
        return;
      }
      
      if (session?.user) {
        setUser(session.user);
        await refreshProfile(session.user.id);
        
        if (session.user.email) {
          const adminStatus = await checkAdminStatus(session.user.email);
          console.log('Admin status updated:', adminStatus);
          setIsAdmin(adminStatus);
        }
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (email: string): Promise<boolean> => {
    try {
      console.log('Checking admin status for:', email);
      const { data, error } = await supabase
        .from('admins')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      console.log('Admin check result:', data, error);
      return !!data && !error;
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  };

  const signIn = async (email?: string, password?: string) => {
    try {
      if (email && password) {
        console.log('Signing in with email:', email);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error('Invalid credentials');
          throw error;
        }
        
        // Check admin status after login
        if (data?.user?.email) {
          console.log("Sign-in successful, checking admin status");
          const adminStatus = await checkAdminStatus(data.user.email);
          setIsAdmin(adminStatus);
          console.log("Admin status set to:", adminStatus);
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
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all state
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
      // Clear any stored tokens
      localStorage.removeItem('supabase.auth.token');
      
      toast.success('Logged out successfully');
      
      // Force navigation to auth page
      navigate('/auth');
      return;
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
        .maybeSingle();
      
      if (data) {
        setProfile(data as UserProfile);
      } else {
        setProfile(null);
      }
      
      if (error) throw error;
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
    checkAdminStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
