import type { ReactNode, RefObject } from "react"
import { cn } from "../utils/utils";

interface Props {
  children: ReactNode;
  dialogRef: RefObject<HTMLDialogElement | null>;
  setOpen: (isOpen: boolean) => void;
  className?: string;
}

export function Modal({children, dialogRef, setOpen, className}: Props) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={() => setOpen(false)}
      onClick={handleBackdropClick}
      className="
        w-full mt-auto mb-0 max-h-[92dvh] rounded-t-2xl rounded-b-none
        lg:m-auto lg:w-fit lg:max-h-[90vh] lg:rounded-lg
        bg-white border border-gray-200
        backdrop:backdrop-blur-sm shadow-xl focus:outline-none
        overflow-hidden
      "
    >
      {/* Drag handle — solo mobile */}
      <div className="flex justify-center pt-3 pb-1 lg:hidden">
        <div className="w-10 h-1 rounded-full bg-gray-300" />
      </div>

      <div
        className={cn(
          "relative px-6 py-5 lg:px-8 lg:py-8 flex flex-col gap-6 lg:gap-8 overflow-y-auto",
          className
        )}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-gray-500 cursor-pointer transition-colors px-2 rounded hover:text-red"
          aria-label="Cerrar modal"
        >
          ✕
        </button>
        {children}
      </div>
    </dialog>
  )
}
