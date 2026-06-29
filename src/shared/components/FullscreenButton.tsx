import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { useFullscreen } from "@/shared/hooks/useFullscreen";

interface Props {
  /** Muestra la etiqueta de texto (para el aside expandido). */
  expanded?: boolean;
  className?: string;
}

export function FullscreenButton({ expanded = false, className = "" }: Props) {
  const { isFullscreen, toggle } = useFullscreen();
  const label = isFullscreen ? "Salir de pantalla completa" : "Pantalla completa";
  const Icon = isFullscreen ? MdFullscreenExit : MdFullscreen;

  return (
    <button
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`flex gap-2 items-center rounded-md h-10 px-2 cursor-pointer text-foreground/70 hover:text-foreground hover:bg-white/5 transition-colors ${className}`}
    >
      <Icon className="text-2xl shrink-0" />
      <span
        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
          expanded ? "max-w-32 opacity-100 translate-x-0" : "max-w-0 opacity-0 -translate-x-2"
        }`}
      >
        {isFullscreen ? "Restaurar" : "Pantalla"}
      </span>
    </button>
  );
}
