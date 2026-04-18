import z from "zod";

export const createTableRequestSchema = z.object({
  number: z.string().min(1, "El numero de la mesa es obligatoria")
});

export const updateTableRequestSchema = createTableRequestSchema.extend({});

export type CreateTableRequest = z.infer<typeof createTableRequestSchema>;
export type UpdateTableRequest = z.infer<typeof createTableRequestSchema>;
