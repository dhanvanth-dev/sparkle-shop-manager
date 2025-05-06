
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LucideLoader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    console.log("AuthGuard checking auth status:", { user: !!user, isAdmin, loading });
    
    if (!loading) {
      if (!user) {
        console.log("No user, redirecting to login");
        navigate('/admin/login');
      } else if (!isAdmin) {
        // User is logged in but not an admin
        console.log("User is not admin, redirecting to home");
        navigate('/');
      } else {
        console.log("User is authenticated and admin");
      }
    }
  }, [user, loading, navigate, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LucideLoader2 className="h-12 w-12 animate-spin text-gold" />
      </div>
    );
  }

  return user && isAdmin ? <>{children}</> : null;
};

export default AuthGuard;
