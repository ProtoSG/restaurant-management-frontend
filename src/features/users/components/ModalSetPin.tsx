import { useEffect, useState } from "react";
import { Modal, TitleModal } from "@/shared/components";
import { useModal } from "@/shared/hooks/useModal";
import { getApiErrorMessage } from "@/shared/utils/apiError";
import { PinPad } from "@/features/auth/components/PinPad";
import type { User } from "../types/User";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sourceRef: React.RefObject<HTMLElement | null>;
  user: User | null;
  onSetPin: (args: { id: number; pin: string }) => Promise<unknown>;
  isSubmitting: boolean;
}

/**
 * Único lugar donde se asigna/resetea el PIN de un mesero o cajero — a propósito no hay
 * autoservicio (el propio usuario no puede elegir su PIN), mismo criterio que la contraseña
 * hoy: solo un ADMIN la escribe, vía ModalUserForm.
 */
export function ModalSetPin({ isOpen, onClose, sourceRef, user, onSetPin, isSubmitting }: Props) {
  const dialogRef = useModal(isOpen, sourceRef);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  const handleComplete = async (pin: string) => {
    if (!user) return;
    try {
      await onSetPin({ id: user.id, pin });
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <Modal dialogRef={dialogRef} setOpen={onClose}>
      <TitleModal>{user ? `PIN de ${user.name}` : "PIN"}</TitleModal>

      <div className="flex flex-col items-center gap-4 min-w-[280px] py-2">
        <p className="text-sm text-gray-500 text-center">
          Elegí un PIN de 4 dígitos — {user?.name} lo va a usar para entrar sin contraseña.
        </p>
        <PinPad
          key={user?.id ?? "none"}
          error={error}
          isVerifying={isSubmitting}
          onComplete={handleComplete}
        />
      </div>
    </Modal>
  );
}
