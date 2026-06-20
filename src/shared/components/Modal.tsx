import type { ReactNode, RefObject } from "react"
import { cn } from "../utils/utils";
import { MdArrowBack } from "react-icons/md";

interface Props {
  children: ReactNode;
  dialogRef: RefObject<HTMLDialogElement | null>;
  setOpen: (isOpen: boolean) => void;
  className?: string;
  fullScreenMobile?: boolean;
}

export function Modal({children, dialogRef, setOpen, className, fullScreenMobile}: Props) {
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
      className={cn(
        "bg-white backdrop:backdrop-blur-sm shadow-[12px_12px_5px_1px] shadow-card-background focus:outline-none overflow-hidden",
        fullScreenMobile
          ? "m-auto w-fit max-w-[95vw] max-h-[90vh] rounded-lg max-lg:w-full max-lg:max-w-none max-lg:h-[100dvh] max-lg:max-h-none max-lg:rounded-none max-lg:m-0"
          : "m-auto w-fit max-w-[95vw] max-h-[90vh] rounded-lg"
      )}
    >
      <div
        className={cn(
          "relative px-6 py-5 lg:px-8 lg:py-8 flex flex-col gap-6 lg:gap-8 overflow-y-auto",
          fullScreenMobile && "max-lg:h-full",
          className
        )}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 left-4 text-gray-500 cursor-pointer transition-colors p-1 rounded hover:text-red focus:outline-none"
          aria-label="Cerrar modal"
        >
          <MdArrowBack size={22} />
        </button>
        {children}
      </div>
    </dialog>
  )
}
