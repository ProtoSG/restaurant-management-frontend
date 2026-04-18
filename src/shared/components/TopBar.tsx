import { useAuth } from "@/features/auth"
import { IoLogOutOutline } from "react-icons/io5"
import type { RoleName } from "@/features/auth/types/Login"

const ROLE_LABELS: Record<RoleName, string> = {
  ADMIN:   "Administrador",
  CASHIER: "Cajero",
  WAITER:  "Mesero",
  CHEF:    "Cocinero",
}

const ROLE_COLORS: Record<RoleName, string> = {
  ADMIN:   "bg-red/20 text-red border border-red/30",
  CASHIER: "bg-orange/20 text-orange border border-orange/30",
  WAITER:  "bg-green/20 text-green border border-green/30",
  CHEF:    "bg-blue-500/20 text-blue-300 border border-blue-400/30",
}

function getInitial(username?: string) {
  return username ? username[0].toUpperCase() : "?"
}

export function TopBar() {
  const { user, logout } = useAuth()

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-background border-b border-white/10 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between px-4 h-14">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange/20 flex items-center justify-center">
            <span className="text-orange text-sm">🍽</span>
          </div>
          <span className="text-base font-bold text-foreground tracking-tight">La Carte</span>
        </div>

        {/* Usuario + logout */}
        <div className="flex items-center gap-2">
          {/* Avatar con inicial */}
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

          {/* Logout */}
          <button
            onClick={logout}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red/20 hover:text-red text-foreground/60 transition-colors cursor-pointer"
            aria-label="Cerrar sesión"
          >
            <IoLogOutOutline className="text-lg rotate-180" />
          </button>
        </div>
      </div>
    </header>
  )
}
