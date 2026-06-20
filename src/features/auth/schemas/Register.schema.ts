import z from "zod";

export const registerRequestSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  username: z.string().min(1, "El nombre de usuario es obligatorio"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(['ADMIN', 'CASHIER', 'CHEF', 'WAITER'], {
    error: "El rol es obligatorio"
  })
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
