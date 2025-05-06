
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { uploadProductImage } from '@/services/productService';
import { LucideUploadCloud, LucideLoader2 } from 'lucide-react';
import { FormControl } from '@/components/ui/form';

interface ProductImageUploadProps {
  initialImage?: string;
  onImageUploaded: (url: string) => void;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({ 
  initialImage, 
  onImageUploaded 
}) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialImage);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadProductImage(file);
      if (url) {
        setImageUrl(url);
        onImageUploaded(url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div>
      <Label>Product Image</Label>
      <div className="mt-1 flex items-center space-x-4">
        <FormControl>
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
        </FormControl>

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
  );
};

export default ProductImageUpload;
