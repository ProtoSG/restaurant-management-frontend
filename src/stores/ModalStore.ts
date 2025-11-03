import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

const createModalStore = () => create<ModalState>((set) => ({
  isOpen: false,
  setOpen: (isOpen: boolean) => set({isOpen})
}))

export const useTableEditModalStore = createModalStore();
export const useOrderItemsModalStore = createModalStore();
export const useProductListModalStore = createModalStore();
