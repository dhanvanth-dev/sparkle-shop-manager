
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  // Parse the amount to ensure it's a number
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Check if the conversion resulted in a valid number
  if (isNaN(numericAmount)) {
    return '$0.00';
  }
  
  // Format as USD currency
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
}
