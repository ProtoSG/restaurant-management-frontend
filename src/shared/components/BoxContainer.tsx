import type { ReactNode } from "react"
import { cn } from "../utils/utils";

interface Props {
  children  : ReactNode;
  className?: string;
}

export default function BoxContainer({children, className}: Props) {
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 shadow-[12px_12px_5px_1px] shadow-card-background border border-gray-100",
      className
    )}>
      {children}
    </div>
  )
}

