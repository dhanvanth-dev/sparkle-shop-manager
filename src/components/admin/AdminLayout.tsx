
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/services/authService';
import { LucideLayoutDashboard, LucidePackagePlus, LucideLogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (!user) {
    navigate('/admin/login');
    return null;
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
