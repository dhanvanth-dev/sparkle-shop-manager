
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ProductFormData } from '@/types/product';
import { uploadProductImage } from '@/services/productService';
import { LucideUploadCloud, LucideLoader2 } from 'lucide-react';

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  isLoading: boolean;
}

const categories = [
  { value: 'earrings', label: 'Earrings' },
  { value: 'chains', label: 'Chains' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'rings', label: 'Rings' },
  { value: 'necklaces', label: 'Necklaces' },
  { value: 'pendants', label: 'Pendants' },
];

const genders = [
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
  { value: 'unisex', label: 'Unisex' },
];

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialData?.image_url);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const defaultValues: ProductFormData = initialData || {
    name: '',
    price: 0,
    category: 'earrings',
    gender: 'unisex',
    description: '',
    image_url: '',
    is_new_arrival: false,
    is_sold_out: false,
  };

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
    defaultValues,
  });

  const watchedIsNewArrival = watch('is_new_arrival');
  const watchedIsSoldOut = watch('is_sold_out');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file);
      if (url) {
        setImageUrl(url);
        setValue('image_url', url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = (data: ProductFormData) => {
    // Convert price to number
    const formattedData = {
      ...data,
      price: Number(data.price),
    };
    onSubmit(formattedData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Product name is required' })}
                error={errors.name?.message}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="price">Price * (in cents)</Label>
              <Input
                id="price"
                type="number"
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' },
                })}
                error={errors.price?.message}
              />
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">Enter price in cents (e.g., 2500 for $25.00)</p>
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                defaultValue={defaultValues.category}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                defaultValue={defaultValues.gender}
                onValueChange={(value) => setValue('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
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

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                rows={4}
              />
            </div>

            <div>
              <Label>Product Image</Label>
              <div className="mt-1 flex items-center space-x-4">
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingImage ? (
                      <LucideLoader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    ) : (
                      <>
                        <LucideUploadCloud className="h-8 w-8 text-gray-400" />
                        <p className="text-xs text-gray-500 mt-1">Upload Image</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>

                {imageUrl && (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_new_arrival"
                  checked={watchedIsNewArrival}
                  onCheckedChange={(checked) => setValue('is_new_arrival', checked as boolean)}
                />
                <Label htmlFor="is_new_arrival">New Arrival</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_sold_out"
                  checked={watchedIsSoldOut}
                  onCheckedChange={(checked) => setValue('is_sold_out', checked as boolean)}
                />
                <Label htmlFor="is_sold_out">Sold Out</Label>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || uploadingImage}>
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
      </CardContent>
    </Card>
  );
};

export default ProductForm;
