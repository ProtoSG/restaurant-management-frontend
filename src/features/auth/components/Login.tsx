import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input } from "@/shared/components";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginRequestSchema } from "../schemas/Login.schema";
import type { LoginRequest } from "../schemas/Login.schema";
import { Variant } from "@/shared/enums/VariantEnum";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useLogin } from "../hooks/useLogin";
import { Toaster } from "sonner"

export function Login() {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { handleLogin } = useLogin();

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
    <section className="w-full flex items-center justify-center" >
      <div className="bg-white p-8 rounded-lg flex flex-col gap-8 border-2 shadow-[12px_12px_5px_1px] shadow-background">
        <h2 className="font-semibold text-xl tracking-wider text-center">¡Bienvenido!</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="text"
            placeholder="DiegoSG"
            label="Nombre de Usuario"
            error={errors.username?.message}
            { ...register("username")}
          />
          <div className="relative">
            <Input 
              type={showPassword ? "text" : "password"}
              placeholder="******"
              label="Contraseña"
              error={errors.password?.message}
              { ...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[42px] text-gray-600  transition-colors cursor-pointer hover:text-green"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
            </button>
          </div>
          <Button variant={Variant.GREEN}>
            Iniciar Sesión
          </Button>
        </form>
      </div>
      <Toaster richColors position="bottom-center" />
    </section>
  )
}
