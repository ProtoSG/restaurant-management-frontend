import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { MdDashboard, MdTableBar, MdOutlineKitchen } from "react-icons/md"
import { BiSolidDish } from "react-icons/bi"
import { PiBowlFoodFill } from "react-icons/pi"
import { IoLogOutOutline } from "react-icons/io5"
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

const ROLE_LABELS: Record<RoleName, string> = {
  ADMIN:   "Administrador",
  CASHIER: "Cajero",
  WAITER:  "Mesero",
  CHEF:    "Cocinero",
}

function getInitial(username?: string) {
  return username ? username[0].toUpperCase() : "?"
}

export function BottomNav() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [showUserSheet, setShowUserSheet] = useState(false)

  const visible = NAV_ITEMS.filter(item =>
    !user?.role || item.roles.includes(user.role)
  )

  return (
    <>
      {/* User sheet overlay */}
      {showUserSheet && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setShowUserSheet(false)}
        >
          <div
            className="absolute bottom-[64px] left-0 right-0 bg-white rounded-t-2xl p-5 flex flex-col gap-4 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange/20 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-orange">{getInitial(user?.username)}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.username}</p>
                <p className="text-sm text-gray-500">{user?.role ? ROLE_LABELS[user.role] : ''}</p>
              </div>
            </div>
            <hr className="border-gray-100" />
            {/* Logout */}
            <button
              onClick={() => { setShowUserSheet(false); logout(); }}
              className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-red hover:bg-red/5 transition-colors cursor-pointer w-full text-left"
            >
              <IoLogOutOutline className="text-xl rotate-180 shrink-0" />
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

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

          {/* Usuario */}
          <button
            onClick={() => setShowUserSheet(!showUserSheet)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-3 min-h-[56px] transition-colors text-xs font-medium cursor-pointer ${showUserSheet ? 'text-orange border-t-2 border-orange -mt-[2px]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <span className="w-6 h-6 rounded-full bg-orange/20 flex items-center justify-center text-orange font-bold text-sm">
              {getInitial(user?.username)}
            </span>
            <span>Perfil</span>
          </button>
        </div>
      </nav>
    </>
  )
}
