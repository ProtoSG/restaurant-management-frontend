import { useLocation, useNavigate } from "react-router-dom"
import { NAV_ITEMS } from "@/shared/config/navigation"
import { useAuth } from "@/features/auth"

const OPERATIONS_PATHS = ["/", "/orders", "/chef", "/tables"]

const GROUPS = [
  { key: 'operations' as const, label: 'Operaciones' },
  { key: 'carta' as const, label: 'Carta' },
  { key: 'settings' as const, label: 'Ajustes' },
]

export function MobileSubNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const role = user?.role

  const visibleGroups = GROUPS.filter((g) =>
    NAV_ITEMS.some((item) => item.group === g.key && (item.roles?.includes(role!) ?? true))
  )

  if (visibleGroups.length <= 1) return null

  const activeGroup = OPERATIONS_PATHS.includes(location.pathname)
    ? 'operations'
    : location.pathname === '/menu'
    ? 'carta'
    : location.pathname === '/settings'
    ? 'settings'
    : null

  const handleGroupClick = (key: typeof GROUPS[number]['key']) => {
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
  }

  return (
    <nav className="lg:hidden bg-background border-b border-white/10">
      <div className="flex px-2 py-2 gap-1">
        {visibleGroups.map((g) => {
          const isActive = g.key === activeGroup
          return (
            <button
              key={g.key}
              onClick={() => handleGroupClick(g.key)}
              className={`
                flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer
                ${isActive
                  ? 'bg-orange/10 text-orange'
                  : 'text-foreground/50 hover:text-foreground hover:bg-white/5'
                }
              `}
            >
              {g.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
