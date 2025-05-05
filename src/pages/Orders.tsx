
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LucideLoader2, PackageCheck, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

interface Order {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_id: string | null;
  order_id: string | null;
  receipt_id: string;
  currency: string;
  shipping_address: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  'created': 'bg-yellow-100 text-yellow-800',
  'paid': 'bg-green-100 text-green-800',
  'failed': 'bg-red-100 text-red-800',
  'refunded': 'bg-purple-100 text-purple-800',
  'processing': 'bg-blue-100 text-blue-800',
  'shipped': 'bg-indigo-100 text-indigo-800',
  'delivered': 'bg-teal-100 text-teal-800',
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/auth?returnTo=/orders');
      return;
    }
    
    loadOrders();
  }, [user, navigate]);
  
  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_orders_with_items');
      
      if (error) {
        throw error;
      }
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Could not load your orders');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center pt-20">
          <LucideLoader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-28 pb-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif">Your Orders</h1>
          <Button 
            onClick={() => navigate('/collections')} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <PackageCheck className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-serif mb-4">No Orders Yet</h2>
              <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
              <Button 
                onClick={() => navigate('/collections')}
                className="bg-gold hover:bg-gold-dark"
              >
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="flex flex-col space-y-0 pb-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">Order #{order.receipt_id}</CardTitle>
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100'}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-md font-medium mt-2 md:mt-0">
                    {formatCurrency(order.amount / 100)}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="mr-4">
                            <span className="text-sm font-medium">{item.quantity}x</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-gray-500">{formatCurrency(item.price / 100)}</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency((item.price * item.quantity) / 100)}
                        </span>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">Shipping Address:</p>
                        <p className="text-gray-500">{order.shipping_address.fullName}</p>
                        <p className="text-gray-500">{order.shipping_address.address}</p>
                        <p className="text-gray-500">
                          {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Order Total:</p>
                        <p className="text-xl font-bold">{formatCurrency(order.amount / 100)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
