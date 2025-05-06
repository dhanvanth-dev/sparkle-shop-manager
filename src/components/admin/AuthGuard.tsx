
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
    if (!loading) {
      if (!user) {
        navigate('/admin/login');
      } else if (!isAdmin) {
        // User is logged in but not an admin
        navigate('/');
      }
    }
  }, [user, loading, navigate, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LucideLoader2 className="h-12 w-12 animate-spin border-b-2 border-gold" />
      </div>
    );
  }

  return user && isAdmin ? <>{children}</> : null;
};

export default AuthGuard;
