
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/product';

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
      setLoading(false);
    };

    loadSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
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
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    navigate('/auth');
  };

  const refreshProfile = async (id: string) => {
    // Use rpc call as a workaround for type issues
    const { data } = await supabase.rpc('get_profile_by_id', { 
      user_id: id 
    } as any);

    if (data && Array.isArray(data) && data.length > 0) {
      setProfile(data[0]);
    } else {
      setProfile(null);
    }
  };

  // Check if the user is an admin by querying the admins table
  const checkAdminStatus = async (email: string): Promise<boolean> => {
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
