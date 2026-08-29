import { MdAdd } from "react-icons/md";
import type { ReactNode } from "react";
import { Variant } from "../enums/VariantEnum";
import { Button } from "./Button";
import { FabButton } from "./FabButton";

interface SecondaryAction {
  label: string;
  function: (source: HTMLElement) => void;
  icon?: ReactNode;
  variant?: Variant;
}

interface Props {
  title: string;
  subTitle: string;
  buttonHide?: boolean;
  buttonLabel: string;
  buttonFunction: (source: HTMLElement) => void;
  secondaryAction?: SecondaryAction;
}

export function HeaderSection({
  title,
  subTitle,
  buttonHide = false,
  buttonLabel,
  buttonFunction,
  secondaryAction
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5 lg:gap-1.5 min-w-0">
        <h1 className="text-xl lg:text-3xl font-bold text-gray-900 truncate">{title}</h1>
        <p className="text-sm text-gray-500 hidden sm:block">
          {subTitle}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {secondaryAction && (
          <>
            <div className="hidden lg:flex">
              <Button
                variant={secondaryAction.variant ?? Variant.ORANGE}
                onClick={(e) => secondaryAction.function(e.currentTarget)}
                className="flex items-center gap-2"
              >
                {secondaryAction.icon ?? <MdAdd size={20} />}
                {secondaryAction.label}
              </Button>
            </div>
            {/* bottom-[15rem] (240px): tercero de tres FABs móviles apilados, con
                margen por arriba de FabButton.tsx (bottom-11rem/176px + 56px de
                alto = hasta 232px). Orden de abajo hacia arriba: mic global
                (VoiceOrderFAB.tsx, bottom-7rem) → "+" de la página (FabButton.tsx,
                bottom-11rem) → esta acción secundaria. */}
            <button
              onClick={(e) => secondaryAction.function(e.currentTarget)}
              aria-label={secondaryAction.label}
              className="
                fixed bottom-[calc(15rem+env(safe-area-inset-bottom))] right-4 z-40 lg:hidden
                w-14 h-14 rounded-full bg-orange outline-2 outline-orange text-foreground
                flex items-center justify-center
                shadow-[4px_4px_12px_0px] shadow-card-background/60
                cursor-pointer transition-all active:scale-95 hover:brightness-110
              "
            >
              {secondaryAction.icon ?? <MdAdd size={28} />}
            </button>
          </>
        )}

        {!buttonHide && (
          <>
            <div className="hidden lg:flex">
              <Button
                variant={Variant.GREEN}
                onClick={(e) => buttonFunction(e.currentTarget)}
                className="flex items-center gap-2"
              >
                <MdAdd size={20} />
                {buttonLabel}
              </Button>
            </div>
            <FabButton onClick={(src) => buttonFunction(src)} label={buttonLabel} />
          </>
        )}
      </div>
    </div>
  )
}
