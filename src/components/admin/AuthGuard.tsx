
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (loading) return;

      if (!user) {
        console.log("AuthGuard: No user found, redirecting to login");
        navigate('/admin/login');
        return;
      }

      // Double-check admin status directly with database
      try {
        if (user.email) {
          const { data, error } = await supabase
            .from('admins')
            .select('email')
            .eq('email', user.email)
            .maybeSingle();

          if (error) {
            console.error("AuthGuard: Error verifying admin status", error);
            throw error;
          }

          if (!data) {
            console.log("AuthGuard: Not an admin account, redirecting to home");
            toast.error("You don't have admin privileges");
            navigate('/');
            return;
          }
        }
      } catch (error) {
        console.error("AuthGuard verification error:", error);
        navigate('/');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAdminStatus();
  }, [user, loading, isAdmin, navigate]);

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return user && isAdmin ? <>{children}</> : null;
};

export default AuthGuard;
