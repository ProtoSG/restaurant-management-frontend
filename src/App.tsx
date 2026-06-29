import { Navigate, Route, Routes } from "react-router-dom"
import { Tables } from "./features/tables"
import { Menu } from "./features/menu"
import { Dashboard } from "./features/dashboard"
import { Settings } from "./features/settings"
import { Layout } from "./shared/layouts/Layout"
import { Orders } from "./features/orders/Orders"
import { ChefOrders } from "./features/chef/ChefOrders"
import { Login, Register } from "./features/auth"
import { Users } from "./features/users"
import { ProtectedRoute } from "./ProtectedRoute"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/chef" element={<ChefOrders />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
