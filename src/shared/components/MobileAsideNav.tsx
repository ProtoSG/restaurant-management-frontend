import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/features/auth"
import { IoLogOutOutline } from "react-icons/io5"
import { MdHome, MdSettings, MdClose } from "react-icons/md"
import { PiBowlFoodFill } from "react-icons/pi"
import { NAV_ITEMS, type NavGroup } from "@/shared/config/navigation"
import { ROLE_LABELS, ROLE_COLORS } from "@/shared/enums/RoleLabels"

const OPERATIONS_PATHS = ["/", "/orders", "/chef", "/tables"]

const GROUP_ITEMS = [
  { key: 'operations' as NavGroup, label: 'Inicio', icon: <MdHome /> },
  { key: 'carta' as NavGroup, label: 'Carta', icon: <PiBowlFoodFill /> },
  { key: 'settings' as NavGroup, label: 'Ajustes', icon: <MdSettings /> },
]

function getInitial(username?: string) {
  return username ? username[0].toUpperCase() : "?"
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function MobileAsideNav({ isOpen, onClose }: Props) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const role = user?.role

  const visibleGroups = GROUP_ITEMS.filter((g) =>
    NAV_ITEMS.some((item) => item.group === g.key && (item.roles?.includes(role!) ?? true))
  )

  const activeGroup: NavGroup | null = OPERATIONS_PATHS.includes(location.pathname)
    ? 'operations'
    : location.pathname === '/menu'
    ? 'carta'
    : location.pathname === '/settings'
    ? 'settings'
    : null

  const handleGroupClick = (key: NavGroup) => {
    if (key === 'operations') {
      const first = NAV_ITEMS.find(
        (item) => item.group === 'operations' && (item.roles?.includes(role!) ?? true)
      )
      if (first) navigate(first.link)
    } else if (key === 'carta') {
      navigate('/menu')
    } else {
      navigate('/settings')
    }
    onClose()
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm
          transition-opacity duration-250
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`
          lg:hidden fixed left-0 top-0 bottom-0 z-50 w-56
          flex flex-col bg-card-background text-foreground
          transition-transform duration-250 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/10 pt-[env(safe-area-inset-top)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange/20 flex items-center justify-center">
              <span className="text-orange text-sm">🍽</span>
            </div>
            <span className="text-base font-bold text-foreground tracking-tight">La Carte</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/5 text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
          {visibleGroups.map((g) => {
            const isActive = g.key === activeGroup
            return (
              <button
                key={g.key}
                onClick={() => handleGroupClick(g.key)}
                className={`
                  flex items-center gap-3 px-3 h-11 rounded-xl cursor-pointer transition-colors duration-150 text-sm font-medium
                  ${isActive
                    ? 'bg-orange/15 text-orange'
                    : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'
                  }
                `}
              >
                <span className="text-xl shrink-0">{g.icon}</span>
                <span>{g.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer: user info + logout */}
        <div className="p-3 border-t border-white/10 flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-orange/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-orange">{getInitial(user?.username)}</span>
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-semibold text-foreground truncate">{user?.username}</span>
              {user?.role && (
                <span className={`text-[10px] font-medium px-1.5 py-px rounded-full w-fit ${ROLE_COLORS[user.role]}`}>
                  {ROLE_LABELS[user.role]}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 h-10 rounded-xl bg-white text-black cursor-pointer transition-colors hover:bg-red text-sm font-medium"
          >
            <IoLogOutOutline className="rotate-180 text-xl shrink-0" />
            <span>Salir</span>
          </button>
        </div>
      </aside>
    </>
  )
}
