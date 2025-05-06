
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { uploadProductImage } from '@/services/productService';
import { LucideUploadCloud, Loader2 } from 'lucide-react';
import { FormControl } from '@/components/ui/form';

interface ProductImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  value,
  onChange,
  onBlur,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      const imageUrl = await uploadProductImage(file);
      onChange(imageUrl);
      if (onBlur) onBlur();
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
        <input
          type="file"
          id="product-image"
          className="sr-only"
          onChange={handleFileChange}
          accept="image/*"
          disabled={disabled || isUploading}
        />
        <FormControl>
          <Label
            htmlFor="product-image"
            className={`flex flex-col items-center justify-center cursor-pointer ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? (
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            ) : (
              <LucideUploadCloud className="h-10 w-10 text-muted-foreground" />
            )}
            <span className="mt-2 text-sm font-medium">
              {isUploading
                ? 'Uploading...'
                : value
                ? 'Change image'
                : 'Upload product image'}
            </span>
          </Label>
        </FormControl>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {value && !isUploading && (
        <div className="mt-2">
          <div className="relative aspect-square w-32 h-32 mx-auto overflow-hidden rounded-md">
            <img
              src={value}
              alt="Product preview"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageUpload;
