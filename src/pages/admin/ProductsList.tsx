
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { packagePlus, Pencil, Trash2, Search, PackagePlus } from 'lucide-react';
import useProducts from '@/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { deleteProduct } from '@/services/productService';
import AdminLayout from '@/components/admin/AdminLayout';

const ProductsList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: products, isLoading, error, refetch } = useProducts();

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    navigate('/admin/products/new');
  };

  const handleRefresh = () => {
    const refreshPromise = refetch();
    toast.promise(refreshPromise, {
      loading: 'Refreshing products...',
      success: 'Products refreshed',
      error: 'Failed to refresh products',
    });
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Products</CardTitle>
          <CardDescription>Manage your product inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4 flex-col md:flex-row gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh}>
                Refresh
              </Button>
              <Button onClick={handleAddProduct}>
                <PackagePlus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Error loading products. Please try again.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts && filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center">
                              <PackagePlus className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={product.in_stock ? "default" : "destructive"}>
                            {product.in_stock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredProducts ? filteredProducts.length : 0} products found
          </div>
        </CardFooter>
      </Card>
    </AdminLayout>
  );
};

export default ProductsList;
