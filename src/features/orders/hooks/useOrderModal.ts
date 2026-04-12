import { useCallback, useState } from "react";

export function useOrderModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openCreate = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    openCreate,
    close,
  };
}