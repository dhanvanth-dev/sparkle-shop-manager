
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  gender?: 'men' | 'women' | 'unisex';
  isSoldOut?: boolean;
  isNewArrival?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  image,
  category,
  gender,
  isSoldOut = false,
  isNewArrival = false,
}) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  
  return (
    <Card className="overflow-hidden group hover-lift">
      <CardContent className="p-0">
        <div className="relative">
          {!imageLoaded && (
            <div className="aspect-square w-full">
              <Skeleton className="h-full w-full rounded-none" />
            </div>
          )}
          <img
            src={image}
            alt={name}
            className={`w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? '' : 'hidden'
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNewArrival && (
              <Badge className="bg-gold text-white border-none">New</Badge>
            )}
            {isSoldOut && (
              <Badge className="bg-charcoal-dark text-white border-none">Sold Out</Badge>
            )}
          </div>
          
          {/* Gender Badge */}
          {gender && gender !== 'unisex' && (
            <Badge className="absolute top-3 right-3 bg-white/80 text-charcoal">
              {gender === 'men' ? "Men's" : "Women's"}
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-lg text-charcoal mb-1 transition-colors group-hover:text-gold">{name}</h3>
          <div className="flex justify-between items-center mt-2">
            <span className="text-charcoal-dark font-semibold">₹{price.toLocaleString()}</span>
            <Link
              to={`/product/${id}`}
              className="text-gold flex items-center gap-1 text-sm font-medium hover:underline"
            >
              View Details <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
