
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { ProductCard, ProductCardProps } from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from '@/components/ui/carousel';

// Mock data - will be replaced with CMS data
const mockFeaturedProducts: ProductCardProps[] = [
  {
    id: '1',
    name: 'Gold Heritage Necklace',
    price: 28500,
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80',
    category: 'necklaces',
    gender: 'women',
    isNewArrival: true
  },
  {
    id: '2',
    name: 'Diamond Studded Ring',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'rings',
    gender: 'unisex',
    isNewArrival: true
  },
  {
    id: '3',
    name: 'Pearl Elegance Earrings',
    price: 18500,
    image: 'https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=781&q=80',
    category: 'earrings',
    gender: 'women',
    isNewArrival: true
  },
  {
    id: '4',
    name: 'Classic Gold Chain',
    price: 42000,
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=686&q=80',
    category: 'chains',
    gender: 'men',
    isNewArrival: true
  },
  {
    id: '5',
    name: 'Ruby Embrace Bracelet',
    price: 36000,
    image: 'https://images.unsplash.com/photo-1616177635753-920dee141885?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
    category: 'bracelets',
    gender: 'women',
    isNewArrival: true
  },
  {
    id: '6',
    name: 'Sapphire Studded Pendant',
    price: 24000,
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80',
    category: 'pendants',
    gender: 'women',
    isNewArrival: true
  },
  {
    id: '7',
    name: 'Emerald Royal Ring',
    price: 56000,
    image: 'https://images.unsplash.com/photo-1608042314453-ae338d80c427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'rings',
    gender: 'women',
    isNewArrival: true,
    isSoldOut: true
  }
];

const heroSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    title: 'Timeless Elegance',
    subtitle: 'Crafted for You'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80',
    title: 'Heritage Collection',
    subtitle: 'Celebrating Traditions'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    title: 'Modern Luxury',
    subtitle: 'For Every Occasion'
  }
];

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [latestProducts, setLatestProducts] = useState<ProductCardProps[]>([]);
  
  useEffect(() => {
    // Simulate API call to CMS
    const timer = setTimeout(() => {
      setLatestProducts(mockFeaturedProducts);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="min-h-screen relative flex items-center justify-center">
        <Carousel className="w-full h-screen" opts={{ loop: true }}>
          <CarouselContent>
            {heroSlides.map((slide) => (
              <CarouselItem key={slide.id}>
                <div className="relative h-screen w-full">
                  <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${slide.image})` }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                    <h1 className="text-4xl md:text-6xl font-serif mb-4 animate-fade-in">
                      {slide.title}
                    </h1>
                    <p className="text-xl md:text-2xl animate-fade-in delay-150">
                      {slide.subtitle}
                    </p>
                    <Link to="/collections">
                      <Button className="mt-8 bg-gold hover:bg-gold-dark text-white border-none animate-fade-in delay-300">
                        Explore Collections
                      </Button>
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </section>
      
      {/* Latest Products Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif mb-4 animate-fade-in">Latest Creations</h2>
            <p className="text-charcoal-light max-w-2xl mx-auto animate-fade-in delay-150">
              Discover our newest jewelry pieces, crafted with precision and care for those who appreciate beauty in details.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <Skeleton className="h-[300px] w-full rounded-t-lg" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-5 w-1/2" />
                    </div>
                  </Card>
                ))
              : latestProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className={`animate-fade-in`} 
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProductCard {...product} />
                  </div>
                ))
            }
          </div>
          
          <div className="text-center animate-fade-in delay-300">
            <Link to="/collections">
              <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-white">
                View All Collections
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-charcoal text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6 animate-fade-in">
            Find Your Perfect Piece
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in delay-150">
            Each of our creations tells a unique story. Discover yours today.
          </p>
          <Link to="/collections">
            <Button className="bg-gold hover:bg-gold-dark text-white animate-fade-in delay-300">
              Explore Collections
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
