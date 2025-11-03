import { Outlet } from "react-router-dom";
import { AsideNav } from "../components/UI";

export function Layout() {
  return (
    <>
      <AsideNav />
      <Outlet />
    </>
  )
}

