import { useAuth } from "@/features/auth"
import { MdMenu } from "react-icons/md"
import { ROLE_LABELS, ROLE_COLORS } from "@/shared/enums/RoleLabels"

function getInitial(username?: string) {
  return username ? username[0].toUpperCase() : "?"
}

interface Props {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: Props) {
  const { user } = useAuth()

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
            <div className="w-7 h-7 rounded-lg bg-orange/20 flex items-center justify-center">
              <span className="text-orange text-sm">🍽</span>
            </div>
            <span className="text-base font-bold text-foreground tracking-tight">La Carte</span>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1.5">
          <div className="w-6 h-6 rounded-full bg-orange/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-orange">{getInitial(user?.username)}</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-foreground">{user?.username}</span>
            {user?.role && (
              <span className={`text-[10px] font-medium px-1.5 py-px rounded-full w-fit ${ROLE_COLORS[user.role]}`}>
                {ROLE_LABELS[user.role]}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
