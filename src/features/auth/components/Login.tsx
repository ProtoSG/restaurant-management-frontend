import { useForm } from "react-hook-form";
import { Button, Input, PasswordInput } from "@/shared/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginRequestSchema } from "../schemas/Login.schema";
import type { LoginRequest } from "../schemas/Login.schema";
import { Variant } from "@/shared/enums/VariantEnum";
import { useLogin } from "../hooks/useLogin";
import { Toaster } from "sonner"

export function Login() {
  const { handleLogin, loading } = useLogin();

  const {
    register,
    handleSubmit,
    formState: {errors}
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema)
  })

  const onSubmit = async (data: LoginRequest): Promise<void> => {
    await handleLogin(data);
  }

  return (
    <section className="w-full min-h-screen bg-background flex items-center justify-center">
      <div className="
        w-full min-h-screen flex flex-col justify-center gap-8 p-8 bg-white border-card-background
        md:min-h-fit md:w-auto md:rounded-2xl md:border-0 md:shadow-[12px_12px_5px_1px] md:shadow-card-background
      ">
        <h2 className="font-semibold text-xl tracking-wider text-center text-foreground-dark">¡Bienvenido!</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="text"
            placeholder="diegosg"
            label="Nombre de usuario"
            error={errors.username?.message}
            disabled={loading}
            autoFocus
            autoComplete="username"
            { ...register("username")}
          />
          <PasswordInput
            placeholder="******"
            label="Contraseña"
            error={errors.password?.message}
            disabled={loading}
            autoComplete="current-password"
            { ...register("password")}
          />
          <Button variant={Variant.GREEN} disabled={loading} >
            {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </div>
      <Toaster richColors position="bottom-center" />
    </section>
  )
}
