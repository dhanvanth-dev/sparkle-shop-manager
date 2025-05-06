
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "../ui/mode-toggle";
import { ShoppingBag, Heart, User, Menu, Package, Home, PackagePlus, LayoutDashboard, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="text-2xl font-bold font-serif">
          Saaral
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <Link to="/collections" className="hover:text-gold transition-colors">
            Collections
          </Link>
          {user ? (
            <>
              <Link to="/saved-items" className="hover:text-gold transition-colors">
                Saved Items
              </Link>
              <Link to="/profile" className="hover:text-gold transition-colors">
                Profile
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth" className="hover:text-gold transition-colors">
              Sign In
            </Link>
          )}
          <ModeToggle />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader className="text-left">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Explore Saaral
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-base"
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                <Link
                  to="/collections"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 text-base"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Collections
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/saved-items"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 text-base"
                    >
                      <Heart className="h-5 w-5" />
                      Saved Items
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 text-base"
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 text-base"
                    >
                      <Package className="h-5 w-5" />
                      Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 py-2 text-base"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-base"
                  >
                    <User className="h-5 w-5" />
                    Sign In
                  </Link>
                )}
              </div>
              <ModeToggle />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
