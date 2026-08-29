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
      // z-[45]: por encima de BottomNav/MobileAsideNav (z-40) a propósito, no por
      // orden de montaje accidental — sigue visible/clickeable sobre la nav móvil.
      // Este es global (toda página, ver Layout.tsx) mientras que FabButton.tsx (el
      // "+" para llevar) es por página (solo Users/Menu/Orders/Tables) — por eso el
      // mic ocupa la posición base/baja, y es FabButton el que se corre para arriba
      // cuando coincide en la misma pantalla, no al revés. Sin esto, en una página
      // sin FabButton (Dashboard, Settings…) el mic quedaba flotando arriba sin motivo.
      className="fixed z-[45] right-4 bottom-[calc(7rem+env(safe-area-inset-bottom))] lg:right-8 lg:bottom-8 w-14 h-14 rounded-full bg-orange text-white shadow-lg flex items-center justify-center text-xl cursor-pointer hover:opacity-90 active:opacity-75 transition-opacity"
    >
      <FaMicrophone />
    </button>
  );
}
