import type { ReactNode } from "react";

export function TitelModal({children}: {children: ReactNode}) {
  return (
    <h3 className="text-center font-semibold text-2xl">
      {children}
    </h3>
  )
}
