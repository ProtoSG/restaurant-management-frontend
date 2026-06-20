import { Link, useLocation } from "react-router-dom"
import { NAV_ITEMS } from "@/shared/config/navigation"
import { useAuth } from "@/features/auth"

export function BottomNav() {
  const location = useLocation()
  const { user } = useAuth()
  const role = user?.role

  const items = NAV_ITEMS.filter(
    (item) => item.group === 'operations' && (item.roles?.includes(role!) ?? true)
  )

  return (
    <nav className="lg:hidden fixed bottom-4 left-0 right-0 z-40 mx-4 rounded-2xl bg-card-background pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch">
        {items.map((item) => {
          const isActive = location.pathname === item.link
          return (
            <Link
              key={item.link}
              to={item.link}
              className={`
                flex flex-col items-center justify-center gap-1 flex-1 py-3 min-h-[56px]
                transition-colors text-xs font-medium
                ${isActive ? "text-orange" : "text-foreground hover:text-foreground/80"}
              `}
            >
              <span className="text-2xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
