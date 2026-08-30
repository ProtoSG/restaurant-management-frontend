import { useEffect, useState } from "react";
import { FaBackspace } from "react-icons/fa";
import { cn } from "@/shared/utils/utils";

const PIN_LENGTH = 4;
const DIGIT_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "backspace"] as const;

interface Props {
  onComplete: (pin: string) => void;
  /** Mensaje de error a mostrar (PIN incorrecto, bloqueo temporal, etc.) — dispara el shake. */
  error?: string | null;
  /** true mientras se verifica el PIN contra el backend — el teclado se deshabilita. */
  isVerifying?: boolean;
  /** true durante un bloqueo temporal por intentos fallidos — deshabilita todo el teclado. */
  isLocked?: boolean;
}

/**
 * Teclado numérico tipo "desbloquear celular": 4 puntos que se van llenando a
 * medida que se toca cada dígito, envío automático al completar el cuarto.
 * No hay input de texto real — todo es táctil, a propósito (mismo criterio
 * que un lock screen: rápido, sin teclado del sistema de por medio).
 */
export function PinPad({ onComplete, error, isVerifying = false, isLocked = false }: Props) {
  const [digits, setDigits] = useState("");
  const [shake, setShake] = useState(false);

  // Un error nuevo (PIN incorrecto, bloqueo) limpia los puntos y dispara el shake — el mesero
  // ve de inmediato que falló, sin tener que borrar el PIN a mano.
  useEffect(() => {
    if (!error) return;
    setDigits("");
    setShake(true);
    const timeout = window.setTimeout(() => setShake(false), 400);
    return () => window.clearTimeout(timeout);
  }, [error]);

  const disabled = isVerifying || isLocked;

  const handleDigit = (digit: string) => {
    if (disabled || digits.length >= PIN_LENGTH) return;
    const next = digits + digit;
    setDigits(next);
    if (next.length === PIN_LENGTH) {
      onComplete(next);
    }
  };

  const handleBackspace = () => {
    if (disabled) return;
    setDigits((prev) => prev.slice(0, -1));
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={cn(
          "flex items-center gap-4",
          shake && "animate-[pin-shake_0.4s_ease-in-out]"
        )}
        role="status"
        aria-label={`${digits.length} de ${PIN_LENGTH} dígitos ingresados`}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-colors",
              i < digits.length ? "bg-orange border-orange" : "border-gray-300",
              error && "border-red"
            )}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red font-medium text-center max-w-[240px]">{error}</p>}

      <div className="grid grid-cols-3 gap-4">
        {DIGIT_KEYS.map((key, i) => {
          if (key === "") return <div key={i} />;
          if (key === "backspace") {
            return (
              <button
                key={i}
                type="button"
                onClick={handleBackspace}
                disabled={disabled || digits.length === 0}
                aria-label="Borrar dígito"
                className="w-16 h-16 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <FaBackspace className="text-lg" />
              </button>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleDigit(key)}
              disabled={disabled}
              aria-label={`Dígito ${key}`}
              className="w-16 h-16 flex items-center justify-center rounded-full text-xl font-semibold text-gray-900 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
