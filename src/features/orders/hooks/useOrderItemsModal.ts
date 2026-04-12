import { useCallback, useState } from "react";

export function useOrderItemsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const open = useCallback((orderId: number) => {
    setOrderId(orderId);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setOrderId(null);
  }, []);

  return {
    isOpen,
    orderId,
    open,
    close,
  };
}