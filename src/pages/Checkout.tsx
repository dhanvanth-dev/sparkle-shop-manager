import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideLoader2 } from 'lucide-react';
import { CartItem } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { getCartItems } from '@/services/cartService';
import { formatCurrency } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface ShippingFormData {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(10);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingFormData>();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth?returnTo=/checkout');
      } else {
        loadCartItems();
      }
    }
  }, [user, loading, navigate]);

  const loadCartItems = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const items = await getCartItems(user.id);
      
      // Ensure we're setting CartItem[] type data
      if (Array.isArray(items)) {
        setCartItems(items);
        calculateTotals(items);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = (items: CartItem[]) => {
    const newSubtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const newTax = newSubtotal * 0.08; // 8% tax
    const newTotal = newSubtotal + shipping + newTax;

    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  };

  const onSubmit = (data: ShippingFormData) => {
    console.log('Shipping Information:', data);
    console.log('Order Summary:', {
      subtotal,
      shipping,
      tax,
      total,
      items: cartItems.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }))
    });
    
    navigate('/orders');
  };

  if (loading || (user && isLoading)) {
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
        <h1 className="text-3xl font-serif mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    {...register('fullName', { required: 'Full name is required' })}
                  />
                  {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...register('address', { required: 'Address is required' })}
                  />
                  {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('city', { required: 'City is required' })}
                  />
                  {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    {...register('state', { required: 'State is required' })}
                  />
                  {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    {...register('zipCode', { required: 'Zip code is required' })}
                  />
                  {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode.message}</p>}
                </div>

                <Button type="submit" className="w-full bg-gold hover:bg-gold-dark">
                  Continue to Payment
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="mr-4">
                      <img
                        src={item.product.image_url || '/placeholder.svg'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="font-medium">{formatCurrency(item.product.price * item.quantity)}</div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <div className="w-full space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <Button className="w-full bg-gold hover:bg-gold-dark">
                  Place Order
                </Button>
                <div className="mt-4 flex items-center text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                  <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                  <span>This is a demo website. No actual purchases will be made.</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
