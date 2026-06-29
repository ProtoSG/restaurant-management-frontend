import type { ReactNode } from "react";

interface ErrorStateProps {
  message?: string;
  icon?: ReactNode;
}

export function ErrorState({ message = "Error al cargar los datos", icon }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      {icon && <span className="text-3xl text-red">{icon}</span>}
      <p className="text-red font-medium text-center">{message}</p>
    </div>
  );
}
