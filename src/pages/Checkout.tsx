
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { getCartItems, clearCart } from '@/services/cartService';
import { CartItem } from '@/types/product';
import { LucideLoader2, CheckCircle, ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface CheckoutFormData {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CheckoutFormData>();

  useEffect(() => {
    if (!user) {
      navigate('/auth?returnTo=/checkout');
      return;
    }

    const loadCartItems = async () => {
      setIsLoading(true);
      try {
        const items = await getCartItems();
        setCartItems(items);
        
        if (items.length === 0) {
          toast.error('Your cart is empty');
          navigate('/cart');
        }
      } catch (error) {
        console.error('Error loading cart items:', error);
        toast.error('Failed to load your cart');
      } finally {
        setIsLoading(false);
      }
    };

    loadCartItems();

    // Pre-populate form with user info if available
    if (profile) {
      setValue('fullName', profile.full_name || '');
      setValue('email', profile.email || '');
    }
  }, [user, profile, navigate, setValue]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(async () => {
      try {
        // This is a demo - no real payment processing
        // In a real app, you would call a payment processing service here
        
        // Clear the cart after successful checkout
        await clearCart();
        
        setOrderComplete(true);
        toast.success('Order placed successfully!');
      } catch (error) {
        console.error('Error processing order:', error);
        toast.error('Failed to process your order');
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center pt-20">
          <LucideLoader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      </Layout>
    );
  }

  if (orderComplete) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
          <div className="flex flex-col items-center text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-3xl font-serif mb-4">Order Confirmed!</h1>
            <p className="text-lg mb-8 max-w-xl">
              Thank you for your purchase. Your order has been received and is now being processed.
              You will receive a confirmation email shortly.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate('/collections')}
              >
                <ArrowLeft size={16} />
                Continue Shopping
              </Button>
              <Button className="bg-gold hover:bg-gold-dark" onClick={() => navigate('/profile')}>
                View Your Orders
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-28 pb-16 max-w-6xl">
        <h1 className="text-3xl font-serif mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="p-6">
                  <h2 className="text-xl font-medium mb-6">Shipping Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        {...register('fullName', { required: 'Full name is required' })}
                        className={errors.fullName ? 'border-red-500' : ''}
                      />
                      {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: 'Please enter a valid email'
                          }
                        })}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        {...register('address', { required: 'Address is required' })}
                        className={errors.address ? 'border-red-500' : ''}
                      />
                      {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        {...register('city', { required: 'City is required' })}
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input 
                          id="state" 
                          {...register('state', { required: 'State is required' })}
                          className={errors.state ? 'border-red-500' : ''}
                        />
                        {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input 
                          id="zipCode" 
                          {...register('zipCode', { required: 'ZIP code is required' })}
                          className={errors.zipCode ? 'border-red-500' : ''}
                        />
                        {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode.message}</p>}
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <h2 className="text-xl font-medium mb-6">Payment Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative">
                        <Input 
                          id="cardNumber" 
                          placeholder="•••• •••• •••• ••••"
                          {...register('cardNumber', { 
                            required: 'Card number is required',
                            pattern: {
                              value: /^[0-9]{16}$/,
                              message: 'Please enter a valid 16-digit card number'
                            }
                          })}
                          className={`pl-10 ${errors.cardNumber ? 'border-red-500' : ''}`}
                        />
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                      </div>
                      {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date (MM/YY)</Label>
                      <Input 
                        id="expiryDate" 
                        placeholder="MM/YY"
                        {...register('expiryDate', { 
                          required: 'Expiry date is required',
                          pattern: {
                            value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                            message: 'Please enter a valid expiry date (MM/YY)'
                          }
                        })}
                        className={errors.expiryDate ? 'border-red-500' : ''}
                      />
                      {errors.expiryDate && <p className="text-red-500 text-sm">{errors.expiryDate.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input 
                        id="cvv" 
                        type="password"
                        placeholder="•••"
                        {...register('cvv', { 
                          required: 'CVV is required',
                          pattern: {
                            value: /^[0-9]{3,4}$/,
                            message: 'Please enter a valid CVV'
                          }
                        })}
                        className={errors.cvv ? 'border-red-500' : ''}
                      />
                      {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv.message}</p>}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-6 pt-0">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/cart')}
                    disabled={isProcessing}
                  >
                    <ArrowLeft size={16} className="mr-2" /> Back to Cart
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gold hover:bg-gold-dark"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Complete Order'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 flex-shrink-0">
                        <img
                          src={item.product.image_url || '/placeholder.svg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(calculateSubtotal() * 0.18)}</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(calculateSubtotal() + calculateSubtotal() * 0.18)}</span>
                </div>
                
                <div className="mt-6 flex items-center text-sm text-emerald-700 bg-emerald-50 p-3 rounded-md">
                  <ShieldCheck size={16} className="mr-2 flex-shrink-0" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
                
                <div className="mt-4 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                  <p>This is a demo website. No actual purchases will be made.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
