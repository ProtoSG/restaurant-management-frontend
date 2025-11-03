import type { ReactNode } from "react";
import { Variant } from "../../enums/VariantEnum";

interface Props {
  variant?: Variant;
  children: ReactNode
}

export function Tag({children, variant=Variant.DEFAULT}: Props) {

  const variants = {
    [Variant.GREEN]: 'bg-green/80 text-green-800',
    [Variant.ORANGE]: 'bg-orange/80 text-orange-800',
    [Variant.RED]: 'bg-red/80 text-red-800',
    [Variant.DEFAULT]: 'bg-background text-foreground'
  }

  return (
    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}
