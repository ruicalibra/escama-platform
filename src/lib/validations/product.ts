import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().optional(),
  price: z.number().positive("Preço deve ser positivo"),
  unit: z.enum(["kg", "g", "un", "lt", "ml", "caixa", "dz"]),
  productType: z.enum(["fresh", "frozen", "processed", "live", "dried"]).optional(),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  origin: z.string().optional(),
  species: z.string().optional(),
  minQty: z.number().positive().optional(),
  maxQty: z.number().positive().optional(),
  qtyStep: z.number().positive().optional(),
  allergens: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.object({ url: z.string().url(), alt: z.string() })).optional(),
  preparationOptions: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
