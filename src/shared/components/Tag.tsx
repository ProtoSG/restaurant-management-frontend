import type { ReactNode } from "react";
import { Variant } from "../enums/VariantEnum";

interface Props {
  variant?: Variant;
  children: ReactNode
}

export function Tag({children, variant=Variant.DEFAULT}: Props) {

  const variants = {
    [Variant.GREEN]: 'bg-green/15 text-background',
    [Variant.ORANGE]: 'bg-orange/25 text-background',
    [Variant.RED]: 'bg-red/20 text-background',
    [Variant.DEFAULT]: 'bg-background text-foreground'
  }

  return (
    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}
