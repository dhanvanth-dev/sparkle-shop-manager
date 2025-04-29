
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductForm from '@/components/admin/ProductForm';
import { ProductFormData } from '@/types/product';
import { getProductById, updateProduct } from '@/services/productService';
import { Skeleton } from '@/components/ui/skeleton';

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
        } else {
          navigate('/admin/products');
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleSubmit = async (data: ProductFormData) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const updated = await updateProduct(id, data);
      if (updated) {
        navigate('/admin/products');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      
      {isFetching ? (
        <div className="space-y-4 max-w-2xl">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : product ? (
        <div className="max-w-2xl">
          <ProductForm 
            initialData={product}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <p>Product not found.</p>
      )}
    </AdminLayout>
  );
};

export default EditProduct;
