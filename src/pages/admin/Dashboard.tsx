
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProducts } from '@/services/productService';
import { Product } from '@/types/product';
import { LucidePackage, LucideShoppingCart, LucideAlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const totalProducts = products.length;
  const newArrivals = products.filter(product => product.is_new_arrival).length;
  const soldOut = products.filter(product => product.is_sold_out).length;

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <LucidePackage className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Arrivals</CardTitle>
            <LucideShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : newArrivals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sold Out Items</CardTitle>
            <LucideAlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : soldOut}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left font-medium">Product</th>
                    <th className="py-3 text-left font-medium">Category</th>
                    <th className="py-3 text-left font-medium">Price</th>
                    <th className="py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="py-3 font-medium">{product.name}</td>
                      <td className="py-3 capitalize">{product.category}</td>
                      <td className="py-3">${(product.price / 100).toFixed(2)}</td>
                      <td className="py-3">
                        {product.is_sold_out ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                            Sold Out
                          </span>
                        ) : product.is_new_arrival ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                            New Arrival
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No products found. Add some products to see them here.
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Dashboard;
