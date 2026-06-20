import { useCallback, useRef, useState } from "react";

export function useChangeTableModal() {
  const [isOpen, setIsOpen] = useState(false);
  const sourceRef = useRef<HTMLElement | null>(null);
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null);

  const open = useCallback((source?: HTMLElement) => {
    sourceRef.current = source ?? null;
    setSourceRect(source ? source.getBoundingClientRect() : null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSourceRect(null);
  }, []);

  return { isOpen, open, close, sourceRef, sourceRect };
}
