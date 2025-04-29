
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getProductById } from '@/services/productService';
import { Product } from '@/types/product';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const data = await getProductById(id);
        setProduct(data);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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

  return (
    <Layout>
      <div className="container mx-auto py-16 px-4 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">No image available</p>
              </div>
            )}
            
            {product.is_new_arrival && (
              <Badge className="absolute top-4 left-4 bg-gold hover:bg-gold">New Arrival</Badge>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl text-gold font-medium">
                  ${(product.price / 100).toFixed(2)}
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
              disabled={product.is_sold_out}
            >
              {product.is_sold_out ? 'Sold Out' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
