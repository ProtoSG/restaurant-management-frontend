import { Outlet } from "react-router-dom"
import { AsideNav } from "../components"
import { BottomNav } from "../components/BottomNav"
import { TopBar } from "../components/TopBar"

export function Layout() {
  return (
    <div className="flex min-h-dvh max-h-dvh w-full">
      {/* Sidebar — solo desktop */}
      <div className="hidden lg:flex">
        <AsideNav />
      </div>

      {/* Área principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar — solo tablet/móvil */}
        <TopBar />

        {/* Contenido */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — solo tablet/móvil */}
      <BottomNav />
    </div>
  )
}
