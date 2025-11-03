import { useEffect, useRef } from "react";

export function useModal(isOpen: boolean) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (isOpen) dialogRef.current.showModal();
    else dialogRef.current.close();
  }, [isOpen])

  return dialogRef;
}

export const useTableEditModal = (isOpen: boolean) => useModal(isOpen);
export const useOrderItemsModal = (isOpen: boolean) => useModal(isOpen);
export const useProductListModal = (isOpen: boolean) => useModal(isOpen);
