
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
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

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
      
      await unsaveItem(user.id, product.id);
      toast.success('Item removed from saved items');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
      // Revert the UI update if the operation fails
      setSaved(true);
    }
  };

  const handleNextImage = () => {
    if (!product) return;
    
    const totalImages = product.additional_images?.length + 1 || 1;
    if (showVideo) {
      setShowVideo(false);
      setCurrentImageIndex(0);
    } else {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
    }
  };

  const handlePreviousImage = () => {
    if (!product) return;
    
    const totalImages = product.additional_images?.length + 1 || 1;
    if (showVideo) {
      setShowVideo(false);
      setCurrentImageIndex(totalImages - 1);
    } else {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
    }
  };

  const handleToggleVideo = () => {
    if (product?.video_url) {
      setShowVideo(!showVideo);
    }
  };

  const getCurrentImage = () => {
    if (!product) return null;
    
    if (showVideo) {
      return (
        <div className="aspect-video w-full h-full flex items-center justify-center bg-black">
          <iframe
            src={product.video_url}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }
    
    if (currentImageIndex === 0) {
      return (
        <img
          src={product.image_url || 'https://placehold.co/400x400?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-contain rounded-t-lg"
        />
      );
    }
    
    const additionalImage = product.additional_images?.[currentImageIndex - 1];
    return additionalImage ? (
      <img
        src={additionalImage}
        alt={`${product.name} - Image ${currentImageIndex}`}
        className="w-full h-full object-contain rounded-t-lg"
      />
    ) : null;
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
            <div className="relative h-[450px]">
              {getCurrentImage()}
              
              {/* Navigation arrows */}
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-white/70 hover:bg-white"
                  onClick={handlePreviousImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-white/70 hover:bg-white"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Thumbnail indicator */}
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center space-x-2">
                <div 
                  className={`w-2 h-2 rounded-full ${currentImageIndex === 0 && !showVideo ? 'bg-gold' : 'bg-gray-400'}`}
                  onClick={() => { setCurrentImageIndex(0); setShowVideo(false); }}
                />
                {product?.additional_images?.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-2 h-2 rounded-full ${currentImageIndex === index + 1 && !showVideo ? 'bg-gold' : 'bg-gray-400'}`}
                    onClick={() => { setCurrentImageIndex(index + 1); setShowVideo(false); }}
                  />
                ))}
                {product?.video_url && (
                  <div 
                    className={`w-2 h-2 rounded-full ${showVideo ? 'bg-gold' : 'bg-gray-400'}`}
                    onClick={handleToggleVideo}
                  />
                )}
              </div>
            </div>
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
