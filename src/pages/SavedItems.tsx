import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideLoader2, X, ShoppingCart, HeartOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { SavedItem } from '@/types/product';
import { 
  fetchSavedItems as getSavedItems, 
  removeFromSavedItems,
  moveToCart 
} from '@/services/savedItemsService';
import { toast } from 'sonner';

const SavedItems: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingItems, setProcessingItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth?returnTo=/saved-items');
      } else {
        loadSavedItems();
      }
    }
  }, [user, loading, navigate]);

  const loadSavedItems = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const items = await getSavedItems(user.id); // Fix: Pass the user.id parameter
      setSavedItems(items || []);
    } catch (error) {
      console.error('Error loading saved items:', error);
      toast.error('Failed to load saved items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setProcessingItems(prev => ({ ...prev, [itemId]: true }));
    const success = await removeFromSavedItems(itemId);
    
    if (success) {
      setSavedItems(prev => prev.filter(item => item.id !== itemId));
    }
    
    setProcessingItems(prev => ({ ...prev, [itemId]: false }));
  };

  const handleMoveToCart = async (item: SavedItem) => {
    setProcessingItems(prev => ({ ...prev, [item.id]: true }));
    const success = await moveToCart(item.id, item.product_id);
    
    if (success) {
      setSavedItems(prev => prev.filter(i => i.id !== item.id));
    }
    
    setProcessingItems(prev => ({ ...prev, [item.id]: false }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100); // Assuming price is stored in cents
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
        <h1 className="text-3xl font-serif mb-8">Saved Items</h1>
        
        {savedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <HeartOff className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">No saved items</h2>
            <p className="text-gray-500 mb-6">Items you save will appear here</p>
            <Button onClick={() => navigate('/collections')} className="bg-gold hover:bg-gold-dark">
              Browse Collections
            </Button>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              {savedItems.map((item) => (
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
                          <p className="font-medium">{formatCurrency(item.product.price)}</p>
                          {item.product.is_sold_out && (
                            <p className="text-sm text-red-500 mt-1">Sold Out</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-end mt-4 gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMoveToCart(item)}
                          disabled={processingItems[item.id] || item.product.is_sold_out}
                          className="flex items-center"
                        >
                          {processingItems[item.id] ? (
                            <LucideLoader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <ShoppingCart size={14} className="mr-1" /> 
                              {item.product.is_sold_out ? 'Out of Stock' : 'Move to Cart'}
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
                            <X size={14} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="mt-6" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SavedItems;
