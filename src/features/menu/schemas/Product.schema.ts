import z from "zod";

export const createProductRequestSchema = z.object({
  name: z.string().min(1, "El nombre del producto es obligatorio"),
  price: z.string().min(1, "El precio es obligatorio"),
  categoryId: z.string().min(1, "La categoría es obligatoria")
});

export const updateProductRequestSchema = createProductRequestSchema.extend({});

export type CreateProductRequest = z.infer<typeof createProductRequestSchema>;
export type UpdateProductRequest = z.infer<typeof updateProductRequestSchema>;
