import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Skeleton } from "@/shared/components";
import { usePinLoginCandidates } from "../hooks/usePinLoginCandidates";
import { usePinLogin } from "../hooks/usePinLogin";
import { PinPad } from "./PinPad";
import type { PinLoginCandidate } from "../types/Login";

interface Props {
  onBackToPassword: () => void;
}

function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

/**
 * Login alternativo tipo POS: elegís tu nombre de una lista y desbloqueás con
 * un PIN de 4 dígitos, sin escribir usuario ni contraseña. Pensado para la
 * tablet compartida del salón — WAITER/CASHIER solamente (ver backend).
 */
export function PinLogin({ onBackToPassword }: Props) {
  const { candidates, isLoading, error: candidatesError } = usePinLoginCandidates();
  const { handlePinLogin, loading, error, clearError } = usePinLogin();
  const [selectedUser, setSelectedUser] = useState<PinLoginCandidate | null>(null);

  const handleSelectUser = (candidate: PinLoginCandidate) => {
    clearError();
    setSelectedUser(candidate);
  };

  const handleBackToPicker = () => {
    clearError();
    setSelectedUser(null);
  };

  if (selectedUser) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleBackToPicker}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FaArrowLeft className="text-xs" />
            Cambiar usuario
          </button>
          <p className="font-semibold text-lg text-foreground-dark">{selectedUser.name}</p>
        </div>

        {/* key fuerza a reiniciar el estado interno del pad si el mesero vuelve atrás y
            elige otro usuario — no debe arrastrar dígitos del intento anterior. */}
        <PinPad
          key={selectedUser.id}
          isVerifying={loading}
          error={error}
          onComplete={(pin) => handlePinLogin(selectedUser.id, pin)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">Elegí tu nombre</p>
        <button
          onClick={onBackToPassword}
          className="text-sm font-semibold text-orange hover:underline cursor-pointer"
        >
          Usuario y contraseña
        </button>
      </div>

      {isLoading ? (
        <Skeleton lines={3} />
      ) : candidatesError ? (
        <p className="text-sm text-red text-center py-4">No se pudo cargar la lista de usuarios</p>
      ) : candidates.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          Nadie tiene un PIN configurado todavía — pedile a un administrador que te asigne uno.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-3">
          {candidates.map((candidate) => (
            <li key={candidate.id}>
              <button
                onClick={() => handleSelectUser(candidate)}
                className="w-full flex flex-col items-center gap-2 py-3 px-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                <span className="w-14 h-14 flex items-center justify-center rounded-full bg-orange/10 text-orange text-xl font-semibold">
                  {initials(candidate.name)}
                </span>
                <span className="text-sm font-medium text-gray-900 text-center leading-tight">
                  {candidate.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
