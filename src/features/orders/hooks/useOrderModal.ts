import { useCallback, useRef, useState } from "react";

export function useOrderModal() {
  const [isOpen, setIsOpen] = useState(false);
  const sourceRef = useRef<HTMLElement | null>(null);

  const openCreate = useCallback((source?: HTMLElement) => {
    sourceRef.current = source ?? null;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, openCreate, close, sourceRef };
}
