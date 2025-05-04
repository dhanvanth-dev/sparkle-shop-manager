
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { fetchCartItems as getCartItems, clearCart } from '@/services/cartService';
import { CartItem } from '@/types/product';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, CreditCard, LucideLoader2, TruckIcon } from 'lucide-react';
import Layout from '@/components/layout/Layout';

interface CheckoutFormData {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, profile } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CheckoutFormData>();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth?returnTo=/checkout');
      } else {
        loadCartItems();
      }
    }
  }, [user, loading, navigate]);
  
  useEffect(() => {
    if (profile) {
      setValue('fullName', profile.full_name || '');
      setValue('email', profile.email || '');
    }
  }, [profile, setValue]);
  
  const loadCartItems = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const items = await getCartItems(user.id);
      setCartItems(items);
      
      if (items.length === 0) {
        toast.warning('Your cart is empty');
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      toast.error('Failed to load cart items');
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };
  
  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% tax
  };
  
  const calculateShipping = () => {
    return 500; // Fixed ₹500 shipping
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };
  
  const onSubmit = async (data: CheckoutFormData) => {
    if (!user) return;
    setIsProcessing(true);
    
    try {
      // Simulate processing payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear the cart
      const success = await clearCart(user.id);
      
      if (success) {
        setOrderComplete(true);
        toast.success('Order placed successfully!');
      } else {
        toast.error('Failed to complete order');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Error processing order');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (loading || isLoading) {
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
        <div className="container mx-auto px-4 pt-28 pb-16">
          <div className="max-w-3xl mx-auto">
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-serif mb-2">Order Placed Successfully!</h1>
                  <p className="text-gray-500 mb-6">Thank you for your purchase.</p>
                  
                  <div className="bg-gray-50 p-6 rounded-md mb-6">
                    <p className="text-sm text-gray-600 mb-2">Order confirmation has been sent to your email.</p>
                    <p className="text-sm text-gray-600">Please note: this is a demo website, and no actual purchase has been made.</p>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => navigate('/')} variant="outline">
                      Continue Shopping
                    </Button>
                    <Button onClick={() => navigate('/profile')} className="bg-gold hover:bg-gold-dark">
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 pt-28 pb-16">
        <h1 className="text-3xl font-serif mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                  <CardDescription>Enter your shipping details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        {...register('fullName', { required: 'Full name is required' })}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-red-500">{errors.fullName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      {...register('address', { required: 'Address is required' })}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        {...register('city', { required: 'City is required' })}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500">{errors.city.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state" 
                        {...register('state', { required: 'State is required' })}
                      />
                      {errors.state && (
                        <p className="text-sm text-red-500">{errors.state.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input 
                        id="zipCode" 
                        {...register('zipCode', { 
                          required: 'Zip code is required',
                          pattern: {
                            value: /^\d{5,6}$/,
                            message: 'Invalid zip code'
                          }
                        })}
                      />
                      {errors.zipCode && (
                        <p className="text-sm text-red-500">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>Enter your payment information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative">
                      <Input 
                        id="cardNumber" 
                        {...register('cardNumber', { 
                          required: 'Card number is required',
                          pattern: {
                            value: /^\d{16}$/,
                            message: 'Invalid card number'
                          }
                        })}
                        placeholder="1234 5678 9012 3456"
                      />
                      <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                    {errors.cardNumber && (
                      <p className="text-sm text-red-500">{errors.cardNumber.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input 
                      id="cardName" 
                      {...register('cardName', { required: 'Name on card is required' })}
                    />
                    {errors.cardName && (
                      <p className="text-sm text-red-500">{errors.cardName.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date (MM/YY)</Label>
                      <Input 
                        id="expiryDate" 
                        {...register('expiryDate', { 
                          required: 'Expiry date is required',
                          pattern: {
                            value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                            message: 'Invalid expiry date (MM/YY)'
                          }
                        })}
                        placeholder="MM/YY"
                      />
                      {errors.expiryDate && (
                        <p className="text-sm text-red-500">{errors.expiryDate.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input 
                        id="cvv" 
                        type="password"
                        {...register('cvv', { 
                          required: 'CVV is required',
                          pattern: {
                            value: /^\d{3,4}$/,
                            message: 'Invalid CVV'
                          }
                        })}
                      />
                      {errors.cvv && (
                        <p className="text-sm text-red-500">{errors.cvv.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-4 flex">
                <Button 
                  type="submit" 
                  className="ml-auto bg-gold hover:bg-gold-dark"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </div>
            </form>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="mr-4">
                        <span className="text-sm font-medium">{item.quantity}x</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Subtotal</span>
                    <span className="text-sm font-medium">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Tax (18%)</span>
                    <span className="text-sm font-medium">{formatCurrency(calculateTax())}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Shipping</span>
                    <span className="text-sm font-medium">{formatCurrency(calculateShipping())}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
                
                <div className="flex items-start text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md mt-4">
                  <AlertTriangle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
                  <span>This is a demo website. No actual purchases will be made.</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between bg-gray-50 border-t">
                <div className="flex items-center text-sm text-gray-600">
                  <TruckIcon size={14} className="mr-1" />
                  <span>Delivery in 3-5 business days</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
