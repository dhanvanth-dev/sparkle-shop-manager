
import * as z from "zod";

export const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  category: z.enum(["earrings", "chains", "bracelets", "rings", "necklaces", "pendants"]),
  gender: z.enum(["women", "men", "unisex"]),
  description: z.string().optional(),
  image_url: z.string().optional(),
  is_new_arrival: z.boolean().default(false),
  is_sold_out: z.boolean().default(false),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
