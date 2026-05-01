import { Outlet } from "react-router-dom"
import { AsideNav } from "../components"
import { BottomNav } from "../components/BottomNav"

export function Layout() {
  return (
    <div className="flex min-h-dvh max-h-dvh w-full p-6 bg-background">
      {/* Sidebar — solo desktop */}
      <div className="hidden lg:flex">
        <AsideNav />
      </div>

      {/* Área principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Contenido */}
        <main className="flex-1 overflow-auto lg:pl-6 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — solo tablet/móvil */}
      <BottomNav />
    </div>
  )
}
