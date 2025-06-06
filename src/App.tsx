
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AppInitializer from "./pages/AppInitializer";
import Home from "./pages/Home";
import About from "./pages/About";
import Collections from "./pages/Collections";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import SavedItems from "./pages/SavedItems";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";

// Admin routes
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard"; 
import ProductsList from "./pages/admin/ProductsList";
import CreateProduct from "./pages/admin/CreateProduct";
import EditProduct from "./pages/admin/EditProduct";
import AuthGuard from "./components/admin/AuthGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppInitializer>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* User authenticated routes */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/saved-items" element={<SavedItems />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/dashboard" element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              } />
              <Route path="/admin/products" element={
                <AuthGuard>
                  <ProductsList />
                </AuthGuard>
              } />
              <Route path="/admin/products/new" element={
                <AuthGuard>
                  <CreateProduct />
                </AuthGuard>
              } />
              <Route path="/admin/products/edit/:id" element={
                <AuthGuard>
                  <EditProduct />
                </AuthGuard>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppInitializer>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
