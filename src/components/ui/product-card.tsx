
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  gender?: string;
  isNewArrival?: boolean;
  isSoldOut?: boolean;
}

export const ProductCard = ({
  id,
  name,
  price,
  image,
  isNewArrival,
  isSoldOut
}: ProductCardProps) => {
  return (
    <Link to={`/product/${id}`}>
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg relative">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
          {isNewArrival && (
            <Badge className="absolute top-2 left-2 bg-gold hover:bg-gold">New</Badge>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <Badge className="bg-charcoal text-white hover:bg-charcoal px-3 py-1 text-sm">Sold Out</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-lg text-charcoal line-clamp-1">{name}</h3>
        </CardContent>
        <CardFooter className="pt-0 pb-4 px-4">
          <p className="text-gold font-medium">${(price / 100).toFixed(2)}</p>
        </CardFooter>
      </Card>
    </Link>
  );
};
