import { Navigate, Route, Routes } from "react-router-dom"
import { Tables } from "./features/tables"
import { Menu } from "./features/menu"
import { Dashboard } from "./features/dashboard"
import { Settings } from "./features/settings"
import { Layout } from "./shared/layouts/Layout"
import { Orders } from "./features/orders/Orders"
import { Login, Register, useAuth, roleHome } from "./features/auth"
import { Users } from "./features/users"
import { ProtectedRoute } from "./ProtectedRoute"

function RoleHomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={roleHome(user?.role)} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          {/* Open to any authenticated staff */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/tables" element={<Tables />} />

          {/* ADMIN only */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route index element={<Dashboard />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<RoleHomeRedirect />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
