import { FaMicrophone } from "react-icons/fa";
import { useAuth } from "@/features/auth";

interface Props {
  onClick: () => void;
}

/**
 * Punto de entrada global del pedido por voz: el mesero dicta la mesa como parte
 * del pedido ("para la mesa 8...") así que este botón no puede depender de estar
 * ya dentro de la pantalla de una mesa puntual — vive en el layout, no en una página.
 *
 * Solo ADMIN por ahora: el backend expone estos endpoints en modo experimental
 * detrás de @PreAuthorize("hasRole('ADMIN')").
 */
export function VoiceOrderFAB({ onClick }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) return null;

  return (
    <button
      onClick={onClick}
      aria-label="Pedido por voz"
      title="Pedido por voz"
      className="fixed z-40 right-4 bottom-24 lg:right-8 lg:bottom-8 w-14 h-14 rounded-full bg-orange text-white shadow-lg flex items-center justify-center text-xl cursor-pointer hover:opacity-90 active:opacity-75 transition-opacity"
    >
      <FaMicrophone />
    </button>
  );
}
