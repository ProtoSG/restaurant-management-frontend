import { type ButtonHTMLAttributes, type ReactNode } from "react"
import { Variant } from "../enums/VariantEnum";
import { cn } from "../utils/utils";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>{
  children: ReactNode;
  variant?: Variant;
  className?: string;
  styleButton?: "Primary" | "Secondary";
}

export const Button = ({children, variant=Variant.DEFAULT, className, styleButton = "Primary", ...props}: Props) => {

  const variants = {
    [Variant.GREEN]: 'hover:bg-green hover:outline-green',
    [Variant.ORANGE]: 'hover:bg-orange hover:outline-orange',
    [Variant.RED]: 'hover:bg-red hover:outline-red',
    [Variant.DEFAULT]: 'hover:bg-card-background hover:outline-card-background'
  }

  if (styleButton === "Primary") {
    return (
      <button 
        className={cn(
          `outline-2 outline-card-background bg-card-background text-foreground 
          font-semibold py-2 px-8 rounded-md cursor-pointer transition-colors
          disabled:bg-card-background/30 disabled:cursor-not-allowed disabled:outline-card-background/30
          ${variants[variant]}`,
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  } else {
    return (
      <button 
        className={cn(
          `outline-2 outline-card-background/80 font-semibold py-2 px-8 rounded-md cursor-pointer transition-colors ${variants[variant]} hover:outline-transparent hover:text-foreground`, className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
}
