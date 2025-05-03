
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "./card";
import { Badge } from "./badge";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  gender?: string;
  isNewArrival?: boolean;
  isSoldOut?: boolean;
  currencyFormat?: string;
}

export const ProductCard = ({
  id,
  name,
  price,
  image,
  category,
  gender,
  isNewArrival = false,
  isSoldOut = false,
  currencyFormat = "INR"
}: ProductCardProps) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(currencyFormat === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency: currencyFormat
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden h-full border-none shadow-sm transition-all hover:shadow-md bg-white">
      <Link to={`/product/${id}`} className="group">
        <div className="relative overflow-hidden aspect-square">
          <img
            src={image}
            alt={name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          {isNewArrival && (
            <Badge className="absolute top-2 left-2 bg-gold hover:bg-gold">New</Badge>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg font-medium px-4 py-1.5">
                Sold Out
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-medium line-clamp-1 text-base md:text-lg">{name}</h3>
          <div className="flex items-center justify-between mt-2">
            <p className="font-medium text-gold">{formatPrice(price)}</p>
            {category && (
              <span className="text-xs text-gray-500 capitalize">{category}</span>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="w-full flex items-center justify-between">
            {gender && (
              <span className="text-xs text-gray-500 capitalize">{gender}</span>
            )}
            <span className="text-xs text-gray-500 underline transition-opacity opacity-0 group-hover:opacity-100">
              View Details
            </span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};
