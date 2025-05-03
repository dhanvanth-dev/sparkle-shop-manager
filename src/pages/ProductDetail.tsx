
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProductById } from '@/services/productService';
import { addToCart } from '@/services/cartService';
import { Product } from '@/types/product';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'images' | 'video'>('images');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const data = await getProductById(id);
        setProduct(data);
        if (data && data.image_url) {
          setSelectedImage(data.image_url);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to your cart");
      navigate('/auth?returnTo=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      const success = await addToCart(product.id);
      if (success) {
        toast.success(`${product.name} added to cart!`);
      } else {
        toast.error("Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("An error occurred while adding to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Mock additional images for demo (this would come from the database in a real implementation)
  const additionalImages = product?.image_url 
    ? [product.image_url, 
       product.image_url.replace('.jpg', '-2.jpg'), 
       product.image_url.replace('.jpg', '-3.jpg')]
    : [];

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-16 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-3xl font-serif mb-4">Product Not Found</h1>
          <p className="text-charcoal-light mb-8">
            We couldn't find the product you're looking for.
          </p>
          <Link to="/collections">
            <Button>Browse Collections</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <Layout>
      <div className="container mx-auto py-16 px-4 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images and Video Section */}
          <div className="relative space-y-4">
            <Tabs 
              defaultValue="images" 
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as 'images' | 'video')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
              </TabsList>
              
              <TabsContent value="images" className="space-y-4">
                {/* Main Image */}
                <div className="relative w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {selectedImage ? (
                    <img 
                      src={selectedImage} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-gray-400">No image available</p>
                  )}
                  
                  {product.is_new_arrival && (
                    <Badge className="absolute top-4 left-4 bg-gold hover:bg-gold">New Arrival</Badge>
                  )}
                </div>

                {/* Thumbnail Images */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {additionalImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`flex-shrink-0 w-20 h-20 border-2 rounded-md overflow-hidden 
                        ${selectedImage === img ? 'border-gold' : 'border-transparent'}`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} view ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="video">
                <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  {/* This would be replaced with an actual video player when videos are available */}
                  <div className="text-center p-8">
                    <p className="text-gray-400">Video coming soon</p>
                    <p className="text-sm text-gray-300 mt-2">Product videos will be available in the future</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl text-gold font-medium">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-charcoal-light capitalize">{product.category}</span>
              </div>
            </div>

            {product.description && (
              <div>
                <h2 className="text-xl font-medium mb-2">Description</h2>
                <p className="text-charcoal-light">
                  {product.description}
                </p>
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-medium mb-2">Details</h2>
              <ul className="list-disc list-inside text-charcoal-light space-y-1">
                <li>Category: <span className="capitalize">{product.category}</span></li>
                {product.gender && <li>For: <span className="capitalize">{product.gender}</span></li>}
                <li>Item ID: {product.id.substring(0, 8)}</li>
              </ul>
            </div>
            
            <Button 
              size="lg"
              className="bg-gold hover:bg-gold-dark w-full md:w-auto"
              disabled={product.is_sold_out || isAddingToCart}
              onClick={handleAddToCart}
            >
              {isAddingToCart ? 'Adding...' : product.is_sold_out ? 'Sold Out' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
