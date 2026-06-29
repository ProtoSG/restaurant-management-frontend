import { useForm } from "react-hook-form";
import { Button, Input, PasswordInput, Select } from "@/shared/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerRequestSchema } from "../schemas/Register.schema";
import type { RegisterRequest } from "../schemas/Register.schema";
import { Variant } from "@/shared/enums/VariantEnum";
import { useRegister } from "../hooks/useRegister";
import { Toaster } from "sonner"
import { Link } from "react-router-dom";

const ROLE_OPTIONS = [
  { value: 'WAITER', label: 'Mesero' },
  { value: 'CASHIER', label: 'Cajero' },
  { value: 'CHEF', label: 'Cocinero' },
  { value: 'ADMIN', label: 'Administrador' },
];

export function Register() {
  const { handleRegister } = useRegister();

  const {
    register,
    handleSubmit,
    formState: {errors}
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
    defaultValues: {
      role: 'WAITER'
    }
  })

  const onSubmit = async (data: RegisterRequest): Promise<void> => {
    await handleRegister(data);
  }

  return (
    <section className="w-full min-h-screen bg-background flex items-center justify-center">
      <div className="
        w-full min-h-screen flex flex-col justify-center gap-8 p-8 bg-white border-card-background
        md:min-h-fit md:w-auto md:rounded-2xl md:border-0 md:shadow-[12px_12px_5px_1px] md:shadow-card-background
      ">
        <h2 className="font-semibold text-xl tracking-wider text-center text-foreground-dark">Crear Usuario</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="text"
            placeholder="Diego Sánchez"
            label="Nombre Completo"
            error={errors.name?.message}
            { ...register("name")}
          />
          <Input
            type="text"
            placeholder="DiegoSG"
            label="Nombre de Usuario"
            error={errors.username?.message}
            { ...register("username")}
          />
          <PasswordInput
            placeholder="******"
            label="Contraseña"
            error={errors.password?.message}
            { ...register("password")}
          />
          <Select
            label="Rol"
            options={ROLE_OPTIONS}
            error={errors.role?.message}
            { ...register("role")}
          />
          <Button variant={Variant.GREEN}>
            Crear Usuario
          </Button>
          <Link
            to="/login"
            className="text-sm text-center text-foreground-dark hover:text-orange transition-colors"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </form>
      </div>
      <Toaster richColors position="bottom-center" />
    </section>
  )
}
