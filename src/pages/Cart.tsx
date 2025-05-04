
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideLoader2, Trash2, Heart, Plus, Minus, AlertTriangle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { CartItem } from '@/types/product';
import { 
  fetchCartItems as getCartItems, 
  updateCartItemQuantity, 
  removeFromCart,
  moveToSavedItems
} from '@/services/cartService';
import { toast } from 'sonner';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingItems, setProcessingItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth?returnTo=/cart');
      } else {
        loadCartItems();
      }
    }
  }, [user, loading, navigate]);

  const loadCartItems = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const items = await getCartItems(user.id);
      setCartItems(items);
    } catch (error) {
      toast.error('Failed to load cart items');
      console.error('Error loading cart items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 10) return;
    
    setProcessingItems(prev => ({ ...prev, [item.id]: true }));
    try {
      const success = await updateCartItemQuantity(item.id, newQuantity);
      
      if (success) {
        setCartItems(prev => 
          prev.map(cartItem => 
            cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem
          )
        );
        toast.success('Quantity updated');
      } else {
        toast.error('Failed to update quantity');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error('Error updating quantity:', error);
    } finally {
      setProcessingItems(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setProcessingItems(prev => ({ ...prev, [itemId]: true }));
    try {
      const success = await removeFromCart(itemId);
      
      if (success) {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
        toast.success('Item removed from cart');
      } else {
        toast.error('Failed to remove item');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error('Error removing item:', error);
    } finally {
      setProcessingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleSaveForLater = async (item: CartItem) => {
    setProcessingItems(prev => ({ ...prev, [item.id]: true }));
    try {
      const success = await moveToSavedItems(item.id, item.product_id);
      
      if (success) {
        setCartItems(prev => prev.filter(cartItem => cartItem.id !== item.id));
        toast.success('Item moved to saved items');
      } else {
        toast.error('Failed to move item');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error('Error saving item:', error);
    } finally {
      setProcessingItems(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
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
        <h1 className="text-3xl font-serif mb-8">Your Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Start adding items to your cart to see them here</p>
            <Button onClick={() => navigate('/collections')} className="bg-gold hover:bg-gold-dark">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="mb-6 last:mb-0">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-24 h-24 flex-shrink-0">
                          <img
                            src={item.product.image_url || '/placeholder.svg'}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                            <div>
                              <h3 className="font-medium">{item.product.name}</h3>
                              <p className="text-sm text-gray-500 mt-1 capitalize">{item.product.gender || 'Unisex'}</p>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(item.product.price * item.quantity)}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {item.quantity > 1 && `${formatCurrency(item.product.price)} each`}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center justify-between mt-4 gap-3">
                            <div className="flex items-center border rounded-md">
                              <button 
                                className="px-3 py-1 border-r disabled:opacity-50"
                                onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                disabled={item.quantity <= 1 || processingItems[item.id]}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-4 py-1">{item.quantity}</span>
                              <button 
                                className="px-3 py-1 border-l disabled:opacity-50"
                                onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                disabled={item.quantity >= 10 || processingItems[item.id]}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSaveForLater(item)}
                                disabled={processingItems[item.id]}
                                className="flex items-center"
                              >
                                {processingItems[item.id] ? (
                                  <LucideLoader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Heart size={14} className="mr-1" /> Save
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={processingItems[item.id]}
                              >
                                {processingItems[item.id] ? (
                                  <LucideLoader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="mt-6" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between font-medium text-lg mb-6">
                    <span>Total</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  
                  <Button 
                    className="w-full bg-gold hover:bg-gold-dark"
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <div className="mt-4 flex items-center text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                    <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                    <span>This is a demo website. No actual purchases will be made.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
