import { useState, forwardRef, type InputHTMLAttributes } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  ({ error, label, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div>
        <label className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground-dark tracking-wide">{label}</p>
          <div className="relative">
            <input
              ref={ref}
              type={showPassword ? "text" : "password"}
              {...props}
              className={`border-2 rounded px-2 py-1 focus:outline-2 focus:outline-orange w-full pr-10 ${
                error ? 'border-red' : 'border-background'
              } ${props.className || ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 transition-colors cursor-pointer hover:text-green"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <FaRegEyeSlash size={18} /> : <FaRegEye size={18} />}
            </button>
          </div>
        </label>
        {error && <p className="text-red font-semibold text-sm mt-1">{error}</p>}
      </div>
    );
  }
);
