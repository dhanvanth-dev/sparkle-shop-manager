
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { ProductCard } from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from '@/components/ui/carousel';
import { useProducts } from '@/hooks/useProducts';

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
  const { products: latestProducts, isLoading: loading } = useProducts();
  
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
              : latestProducts.slice(0, 8).map((product, index) => (
                  <div 
                    key={product.id} 
                    className={`animate-fade-in`} 
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProductCard 
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      image={product.image_url || 'https://placehold.co/400x400?text=No+Image'}
                      category={product.category}
                      gender={product.gender}
                      isNewArrival={product.is_new_arrival}
                      isSoldOut={product.is_sold_out}
                    />
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
