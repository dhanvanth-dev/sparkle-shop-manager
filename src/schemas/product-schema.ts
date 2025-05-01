
import * as z from "zod";
import { ProductCategory, ProductCategories, ProductGender, ProductGenders } from "@/types/product";

export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  category: z.enum(ProductCategories),
  gender: z.enum(ProductGenders),
  description: z.string().optional(),
  image_url: z.string().optional(),
  is_new_arrival: z.boolean().default(false),
  is_sold_out: z.boolean().default(false),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
