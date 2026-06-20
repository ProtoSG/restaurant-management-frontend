import { useState } from "react"
import { Outlet } from "react-router-dom"
import { AsideNav } from "../components"
import { BottomNav } from "../components/BottomNav"
import { TopBar } from "../components/TopBar"
import { MobileAsideNav } from "../components/MobileAsideNav"
import { WsStatusBanner } from "../components/WsStatusBanner"

export function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-dvh max-h-dvh w-full p-0 bg-background">
      <WsStatusBanner />

      {/* Sidebar desktop */}
      <div className="hidden lg:flex p-6 pr-0">
        <AsideNav />
      </div>

      {/* Sidebar mobile — overlay */}
      <MobileAsideNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Área principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-auto h-full pb-24">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — ops sub-tabs, solo móvil */}
      <BottomNav />

      {/* Relleno zona segura inferior — mismo color que header */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 h-[env(safe-area-inset-bottom)] bg-card-background z-30" />
    </div>
  )
}
