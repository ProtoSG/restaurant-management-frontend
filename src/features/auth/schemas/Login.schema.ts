import z from "zod";

export const loginRequestSchema = z.object({
  username: z.string().trim().min(3, "El usuario debe tener al menos 3 caracteres").max(50, "El usuario es demasiado largo"),
  password: z.string().min(1, "La contraseña es obligatoria").max(128, "La contraseña es demasiado larga"),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
