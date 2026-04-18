import { Link, useLocation } from "react-router-dom"
import { MdDashboard, MdTableBar, MdOutlineKitchen } from "react-icons/md"
import { BiSolidDish } from "react-icons/bi"
import { PiBowlFoodFill } from "react-icons/pi"
import { useAuth } from "@/features/auth"
import type { RoleName } from "@/features/auth/types/Login"
import type { ReactNode } from "react"

interface NavItem {
  name: string
  link: string
  icon: ReactNode
  roles: RoleName[]
}

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", link: "/",       icon: <MdDashboard />,        roles: ["ADMIN", "CASHIER"] },
  { name: "Pedidos",   link: "/orders", icon: <BiSolidDish />,        roles: ["ADMIN", "CASHIER", "WAITER"] },
  { name: "Cocina",    link: "/chef",   icon: <MdOutlineKitchen />,   roles: ["ADMIN", "CHEF"] },
  { name: "Mesas",     link: "/tables", icon: <MdTableBar />,         roles: ["ADMIN", "CASHIER", "WAITER"] },
  { name: "Carta",     link: "/menu",   icon: <PiBowlFoodFill />,     roles: ["ADMIN"] },
]

export function BottomNav() {
  const { user } = useAuth()
  const location = useLocation()

  const visible = NAV_ITEMS.filter(item =>
    !user?.role || item.roles.includes(user.role)
  )

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch">
        {visible.map(item => {
          const isActive = location.pathname === item.link
          return (
            <Link
              key={item.link}
              to={item.link}
              className={`
                flex flex-col items-center justify-center gap-1 flex-1 py-3 min-h-[56px]
                transition-colors text-xs font-medium
                ${isActive
                  ? "text-orange border-t-2 border-orange -mt-[2px]"
                  : "text-gray-400 hover:text-gray-600"
                }
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
