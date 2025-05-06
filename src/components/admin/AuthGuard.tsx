
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LucideLoader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    console.log("AuthGuard checking auth status:", { user: !!user, isAdmin, loading });
    
    // Add a short delay to ensure auth state is fully processed
    const timer = setTimeout(() => {
      if (!loading) {
        if (!user) {
          console.log("No user, redirecting to login");
          navigate('/admin/login', { replace: true });
        } else if (!isAdmin) {
          // User is logged in but not an admin
          console.log("User is not admin, redirecting to home");
          navigate('/', { replace: true });
        } else {
          console.log("User is authenticated and admin");
        }
        setLocalLoading(false);
      }
    }, 500); // Slightly longer delay to allow auth state to settle
    
    return () => clearTimeout(timer);
  }, [user, loading, navigate, isAdmin]);

  // Show loading state while checking authentication
  if (loading || localLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LucideLoader2 className="h-12 w-12 animate-spin text-gold" />
      </div>
    );
  }

  return user && isAdmin ? <>{children}</> : null;
};

export default AuthGuard;
