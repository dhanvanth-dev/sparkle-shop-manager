
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { ProductCard } from '@/components/ui/product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/services/productService';
import { Product } from '@/types/product';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'earrings', label: 'Earrings' },
  { value: 'chains', label: 'Chains' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'rings', label: 'Rings' },
  { value: 'necklaces', label: 'Necklaces' },
  { value: 'pendants', label: 'Pendants' },
];

const genders = [
  { value: 'all', label: 'All' },
  { value: 'women', label: 'Women\'s' },
  { value: 'men', label: 'Men\'s' },
  { value: 'unisex', label: 'Unisex' }
];

const Collections: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  useEffect(() => {
    let filtered = [...products];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    
    // Filter by gender
    if (selectedGender !== 'all') {
      filtered = filtered.filter(product => product.gender?.toLowerCase() === selectedGender.toLowerCase());
    }
    
    setFilteredProducts(filtered);
  }, [selectedCategory, selectedGender, products]);
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  const handleGenderChange = (value: string) => {
    setSelectedGender(value);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchProducts();
      toast.success('Products refreshed successfully');
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };
  
  return (
    <Layout>
      {/* Header */}
      <section className="pt-28 pb-16 px-4 bg-gradient-to-b from-gold/10 to-offwhite">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 animate-fade-in">
            Our Collections
          </h1>
          <p className="text-lg text-charcoal-light animate-fade-in delay-150">
            Explore our exquisite range of handcrafted jewelry pieces
          </p>
        </div>
      </section>
      
      {/* Filtering Section - Optimized for mobile */}
      <section className="py-4 px-2 md:py-8 md:px-4 bg-offwhite-dark sticky top-16 z-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Categories Tabs - Scrollable on mobile */}
            <div className="w-full overflow-x-auto pb-2">
              <Tabs defaultValue={selectedCategory} className="w-full" onValueChange={handleCategoryChange}>
                <TabsList className="w-full inline-flex whitespace-nowrap">
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category.value} 
                      value={category.value}
                      className="data-[state=active]:bg-gold data-[state=active]:text-white px-3 py-1.5 text-sm"
                    >
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Gender Filter */}
              <div className="flex-grow md:w-64">
                <Select onValueChange={handleGenderChange} defaultValue="all">
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Filter by Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((gender) => (
                      <SelectItem key={gender.value} value={gender.value}>
                        {gender.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Refresh Button */}
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                disabled={refreshing || loading}
                className="bg-white border-gold text-gold hover:bg-gold hover:text-white transition-colors"
                size="icon"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Products Grid */}
      <section className="py-8 px-2 md:py-12 md:px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <Skeleton className="h-[200px] md:h-[300px] w-full rounded-t-lg" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="animate-fade-in" 
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
                    currencyFormat="INR"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-charcoal mb-2">No products found</h3>
              <p className="text-charcoal-light">
                Try changing your filters to see more products.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Collections;
