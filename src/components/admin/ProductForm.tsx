
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductFormData, ProductCategory, ProductGender } from '@/types/product';
import { LucideLoader2 } from 'lucide-react';
import { productFormSchema, ProductFormValues } from '@/schemas/product-schema';
import { Form } from '@/components/ui/form';
import ProductFormControls from './ProductFormControls';

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  isLoading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const defaultValues: ProductFormValues = {
    name: initialData?.name || '',
    price: initialData?.price || 0,
    category: (initialData?.category as ProductCategory) || 'earrings',
    gender: (initialData?.gender as ProductGender) || 'unisex',
    description: initialData?.description || '',
    image_url: initialData?.image_url || '',
    is_new_arrival: initialData?.is_new_arrival || false,
    is_sold_out: initialData?.is_sold_out || false,
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  const handleFormSubmit = (data: ProductFormValues) => {
    // Convert to ProductFormData and submit
    onSubmit(data as ProductFormData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="space-y-4">
              <ProductFormControls />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || form.formState.isSubmitting}>
              {isLoading ? (
                <>
                  <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  {initialData ? 'Updating...' : 'Creating...'}
                </>
              ) : initialData ? (
                'Update Product'
              ) : (
                'Create Product'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
