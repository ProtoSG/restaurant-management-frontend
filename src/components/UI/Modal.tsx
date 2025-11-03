import type { ReactNode, RefObject } from "react"

interface Props {
  children: ReactNode;
  dialogRef: RefObject<HTMLDialogElement | null>;
  setOpen: (isOpen: boolean) => void;
}

export function Modal({children, dialogRef, setOpen}: Props) {
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
      className="m-auto bg-foreground border-2 rounded-lg backdrop:backdrop-blur-sm  shadow-[12px_12px_5px_1px] shadow-background focus:outline-none"
    >
      <div 
        className="relative px-8 py-8 flex flex-col gap-8">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Cerrar modal"
        >
          ✕
        </button>
        {children}
      </div>
    </dialog>
  )
}
