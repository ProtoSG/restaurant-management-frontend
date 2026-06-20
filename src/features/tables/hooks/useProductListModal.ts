import { useCallback, useRef, useState } from "react";

export function useProductListModal() {
  const [isOpen, setIsOpen] = useState(false);
  const sourceRef = useRef<HTMLElement | null>(null);

  const open = useCallback((source?: HTMLElement) => {
    sourceRef.current = source ?? null;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    open,
    close,
    sourceRef,
  };
}
