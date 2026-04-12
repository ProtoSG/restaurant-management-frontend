import { Navigate, Route, Routes } from "react-router-dom"
import { Tables } from "./features/tables"
import { Menu } from "./features/menu"
import { Dashboard } from "./features/dashboard"
import { Layout } from "./shared/layouts/Layout"
import { ProtectedRoute } from "./ProtectedRoute"
import { Login } from "./features/auth"
import { Orders } from "./features/orders/Orders"
import { useAuth } from "./features/auth"
import type { RoleName } from "./features/auth/types/Login"
import type { ReactNode } from "react"

const ROLE_HOME: Record<RoleName, string> = {
  ADMIN:   '/',
  CASHIER: '/orders',
  WAITER:  '/tables',
  CHEF:    '/orders',
}

interface RoleGuardProps {
  allowed: RoleName[]
  children: ReactNode
}

function RoleGuard({ allowed, children }: RoleGuardProps) {
  const { user } = useAuth()
  const role = user?.role

  if (!role || !allowed.includes(role)) {
    const fallback = role ? ROLE_HOME[role] : '/login'
    return <Navigate to={fallback} replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <RoleGuard allowed={['ADMIN', 'CASHIER']}>
              <Dashboard />
            </RoleGuard>
          } />
          <Route path="/orders" element={
            <RoleGuard allowed={['ADMIN', 'CASHIER', 'WAITER', 'CHEF']}>
              <Orders />
            </RoleGuard>
          } />
          <Route path="/tables" element={
            <RoleGuard allowed={['ADMIN', 'CASHIER', 'WAITER']}>
              <Tables />
            </RoleGuard>
          } />
          <Route path="/menu" element={
            <RoleGuard allowed={['ADMIN']}>
              <Menu />
            </RoleGuard>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
