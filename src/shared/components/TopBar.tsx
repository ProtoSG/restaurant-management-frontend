import { MdMenu } from "react-icons/md"
import { FullscreenButton } from "./FullscreenButton"

interface Props {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: Props) {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-card-background border-b border-white/10 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Hamburguesa + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/5 text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            <MdMenu className="text-2xl" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground tracking-tight">Cevicheria 23</span>
          </div>
        </div>
        <FullscreenButton />
      </div>
    </header>
  )
}
