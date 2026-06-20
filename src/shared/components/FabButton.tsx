import { MdAdd } from "react-icons/md";

interface Props {
  onClick: (source: HTMLElement) => void;
  label?: string;
}

export function FabButton({ onClick, label = "Agregar" }: Props) {
  return (
    <button
      onClick={(e) => onClick(e.currentTarget)}
      aria-label={label}
      className="
        fixed bottom-28 right-4 z-40
        lg:hidden
        w-14 h-14 rounded-full
        bg-green outline-2 outline-green
        text-foreground
        flex items-center justify-center
        shadow-[4px_4px_12px_0px] shadow-card-background/60
        cursor-pointer transition-all
        active:scale-95 hover:brightness-110
      "
    >
      <MdAdd size={28} />
    </button>
  );
}
