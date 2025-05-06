
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/services/authService';
import { LucideLayoutDashboard, LucidePackagePlus, LucideLogOut } from 'lucide-react';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  // Redirect if not admin
  useEffect(() => {
    console.log("AdminLayout auth check:", { isAuthenticated: !!user, isAdmin });
    if (!loading && (!user || !isAdmin)) {
      console.log("Not authenticated as admin, redirecting");
      navigate('/admin/login', { replace: true });
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-charcoal text-white p-4 flex flex-col">
        <div className="text-2xl font-serif mb-8 px-4 pt-4">Admin Panel</div>
        
        <nav className="flex-1 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center gap-2 p-3 rounded hover:bg-charcoal-light">
            <LucideLayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/products" className="flex items-center gap-2 p-3 rounded hover:bg-charcoal-light">
            <LucidePackagePlus size={18} />
            <span>Products</span>
          </Link>
        </nav>
        
        <div className="pt-4 mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-charcoal-light"
            onClick={handleSignOut}
          >
            <LucideLogOut size={18} className="mr-2" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
