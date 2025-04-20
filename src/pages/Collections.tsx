
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { ProductCard, ProductCardProps } from '@/components/ui/product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data - will be replaced with CMS data
const mockProducts: ProductCardProps[] = [
  // Earrings
  {
    id: 'e1',
    name: 'Pearl Drop Earrings',
    price: 18500,
    image: 'https://images.unsplash.com/photo-1535556116002-6281ff3e9f36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=781&q=80',
    category: 'earrings',
    gender: 'women',
    isNewArrival: true
  },
  {
    id: 'e2',
    name: 'Diamond Stud Earrings',
    price: 24000,
    image: 'https://images.unsplash.com/photo-1689928570219-066d210b9b49?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    category: 'earrings',
    gender: 'women'
  },
  {
    id: 'e3',
    name: 'Gold Hoop Earrings',
    price: 16500,
    image: 'https://images.unsplash.com/photo-1630020433642-3022b57b05fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    category: 'earrings',
    gender: 'women'
  },
  
  // Chains
  {
    id: 'c1',
    name: 'Classic Gold Chain',
    price: 42000,
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=686&q=80',
    category: 'chains',
    gender: 'men',
    isNewArrival: true
  },
  {
    id: 'c2',
    name: 'Silver Link Chain',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1588444650733-d98404455ed1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    category: 'chains',
    gender: 'men'
  },
  {
    id: 'c3',
    name: 'Pearl Pendant Chain',
    price: 36000,
    image: 'https://images.unsplash.com/photo-1585367471632-1ef13dae1048?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    category: 'chains',
    gender: 'women'
  },
  
  // Bracelets
  {
    id: 'b1',
    name: 'Ruby Embrace Bracelet',
    price: 36000,
    image: 'https://images.unsplash.com/photo-1616177635753-920dee141885?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
    category: 'bracelets',
    gender: 'women',
    isNewArrival: true
  },
  {
    id: 'b2',
    name: 'Gold Link Bracelet',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'bracelets',
    gender: 'men'
  },
  {
    id: 'b3',
    name: 'Diamond Tennis Bracelet',
    price: 64000,
    image: 'https://images.unsplash.com/photo-1602752465623-7e0a0e08d0b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    category: 'bracelets',
    gender: 'women',
    isSoldOut: true
  },
  
  // Rings
  {
    id: 'r1',
    name: 'Diamond Solitaire Ring',
    price: 48000,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'rings',
    gender: 'women'
  },
  {
    id: 'r2',
    name: 'Men\'s Gold Band',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'rings',
    gender: 'men'
  },
  {
    id: 'r3',
    name: 'Emerald Royal Ring',
    price: 56000,
    image: 'https://images.unsplash.com/photo-1608042314453-ae338d80c427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'rings',
    gender: 'women',
    isNewArrival: true,
    isSoldOut: true
  }
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'earrings', label: 'Earrings' },
  { value: 'chains', label: 'Chains' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'rings', label: 'Rings' }
];

const genders = [
  { value: 'all', label: 'All' },
  { value: 'women', label: 'Women\'s' },
  { value: 'men', label: 'Men\'s' },
  { value: 'unisex', label: 'Unisex' }
];

const Collections: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductCardProps[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  
  useEffect(() => {
    // Simulate API call to CMS
    const timer = setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    let filtered = [...products];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Filter by gender
    if (selectedGender !== 'all') {
      filtered = filtered.filter(product => product.gender === selectedGender);
    }
    
    setFilteredProducts(filtered);
  }, [selectedCategory, selectedGender, products]);
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  const handleGenderChange = (value: string) => {
    setSelectedGender(value);
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
      
      {/* Filtering Section */}
      <section className="py-8 px-4 bg-offwhite-dark sticky top-16 z-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={handleCategoryChange}>
              <TabsList className="w-full md:w-auto bg-white grid grid-cols-2 md:flex md:space-x-1">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.value} 
                    value={category.value}
                    className="data-[state=active]:bg-gold data-[state=active]:text-white"
                  >
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            <div className="w-full md:w-64">
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
          </div>
        </div>
      </section>
      
      {/* Products Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <Skeleton className="h-[300px] w-full rounded-t-lg" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="animate-fade-in" 
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard {...product} />
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
