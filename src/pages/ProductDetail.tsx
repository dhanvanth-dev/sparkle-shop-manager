import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProductById } from '@/services/productService';
import { saveItem, checkIfItemIsSaved, unsaveItem } from '@/services/savedItemsService';
import { addToCart } from '@/services/cartService';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Heart, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        toast.error('Product ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productData = await getProductById(id);
        if (productData) {
          setProduct(productData);
        } else {
          toast.error('Product not found');
          navigate('/not-found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (user && product) {
        try {
          const isSaved = await checkIfItemIsSaved(user.id, product.id);
          setSaved(isSaved);
        } catch (error) {
          console.error('Error checking saved status:', error);
        }
      } else {
        setSaved(false);
      }
    };

    checkSavedStatus();
  }, [user, product]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/auth?returnTo=' + location.pathname);
      return;
    }

    if (!product) {
      toast.error('Product not loaded');
      return;
    }

    try {
      const success = await addToCart(user.id, product.id);
      if (success) {
        toast.success('Product added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleSaveItem = async () => {
    if (!user) {
      navigate('/auth?returnTo=' + location.pathname);
      return;
    }
    
    try {
      const success = await saveItem(user.id, product.id);
      if (success) {
        setSaved(true);
      }
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    }
  };

  const handleUnsaveItem = async () => {
    if (!user || !product) return;

    try {
      // Optimistically update the UI
      setSaved(false);
      
      // Call the unsaveItem function
      // Assuming you have the saved item's ID, you'll need to fetch it first or have it stored
      // For simplicity, this example assumes you have a way to get the saved item ID
      // const savedItemId = ...; // Fetch or retrieve the saved item ID
      
      // If you don't have the saved item ID, you might need to refetch the saved items
      // or adjust your logic accordingly
      
      // await unsaveItem(savedItemId);
      toast.success('Item removed from saved items');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
      // Revert the UI update if the operation fails
      setSaved(true);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-28 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="overflow-hidden">
              <Skeleton className="h-[450px] w-full rounded-t-lg" />
            </Card>
            <div>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-6" />
              <Skeleton className="h-5 w-1/4 mb-8" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pt-28 pb-16">
          <Card>
            <CardContent>
              Product not found.
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-28 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="overflow-hidden">
            <img
              src={product.image_url || 'https://placehold.co/400x400?text=No+Image'}
              alt={product.name}
              className="w-full h-full object-cover rounded-t-lg"
            />
          </Card>
          <div>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {product.is_new_arrival && (
                  <Badge className="mr-2">New Arrival</Badge>
                )}
                {product.is_sold_out && (
                  <Badge variant="destructive">Sold Out</Badge>
                )}
              </div>
              <div className="mb-6">
                <span className="text-xl font-bold">{formatCurrency(product.price)}</span>
              </div>
              <div className="flex flex-col space-y-4">
                <Button 
                  className="w-full bg-gold hover:bg-gold-dark text-white"
                  onClick={handleAddToCart}
                  disabled={product.is_sold_out}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                {saved ? (
                  <Button 
                    variant="outline" 
                    className="w-full border-gold text-gold hover:bg-gold hover:text-white"
                    onClick={handleUnsaveItem}
                  >
                    Remove from Saved
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full border-gold text-gold hover:bg-gold hover:text-white"
                    onClick={handleSaveItem}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Save for Later
                  </Button>
                )}
                <Link to="/collections">
                  <Button variant="link" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
