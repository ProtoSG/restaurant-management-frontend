import z from "zod";

export const loginRequestSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria")
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
