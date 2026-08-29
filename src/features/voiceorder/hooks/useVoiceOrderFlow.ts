import { useCallback, useState } from "react";

/** Abre/cierra el flujo de pedido por voz. Vive fuera de cualquier página concreta
 *  porque el punto de entrada es global (ver VoiceOrderFAB). */
export function useVoiceOrderFlow() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, open, close };
}
