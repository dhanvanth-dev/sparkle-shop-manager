
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductForm from '@/components/admin/ProductForm';
import { ProductFormData } from '@/types/product';
import { createProduct } from '@/services/productService';

const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      const product = await createProduct(data);
      if (product) {
        navigate('/admin/products');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <div className="max-w-2xl">
        <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </AdminLayout>
  );
};

export default CreateProduct;
