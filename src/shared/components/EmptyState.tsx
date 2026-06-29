import type { ReactNode } from "react";

interface EmptyStateProps {
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ message = "No hay datos disponibles", icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 border-2 border-dashed border-gray-200 rounded-xl">
      {icon && <span className="text-4xl text-gray-300">{icon}</span>}
      <p className="text-gray-400 text-sm text-center">{message}</p>
      {action}
    </div>
  );
}
