import type { ReactNode } from "react";
import { Variant } from "../enums/VariantEnum";

interface Props {
  variant?: Variant;
  children: ReactNode
}

export function Tag({children, variant=Variant.DEFAULT}: Props) {

  const variants = {
    [Variant.GREEN]: 'bg-green/15 text-foreground-dark',
    [Variant.ORANGE]: 'bg-orange/25 text-foreground-dark',
    [Variant.RED]: 'bg-red/20 text-foreground-dark',
    [Variant.DEFAULT]: 'bg-background text-foreground-dark'
  }

  return (
    <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}
