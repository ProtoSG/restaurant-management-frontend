import { MdDashboard, MdTableBar, MdOutlineKitchen, MdSettings, MdPeople } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import { PiBowlFoodFill } from "react-icons/pi";
import type { ReactNode } from "react";
import type { RoleName } from "@/features/auth/types/Login";

export type NavGroup = 'operations' | 'carta' | 'settings';

export interface NavItem {
  name: string;
  link: string;
  icon: ReactNode;
  roles?: RoleName[];
  group: NavGroup;
}

export const NAV_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    link: "/",
    icon: <MdDashboard />,
    roles: ['ADMIN', 'CASHIER'],
    group: 'operations',
  },
  {
    name: "Pedidos",
    link: "/orders",
    icon: <BiSolidDish />,
    roles: ['ADMIN', 'CASHIER', 'WAITER'],
    group: 'operations',
  },
  {
    name: "Cocina",
    link: "/chef",
    icon: <MdOutlineKitchen />,
    roles: ['ADMIN', 'CHEF'],
    group: 'operations',
  },
  {
    name: "Mesas",
    link: "/tables",
    icon: <MdTableBar />,
    roles: ['ADMIN', 'CASHIER', 'WAITER'],
    group: 'operations',
  },
  {
    name: "Carta",
    link: "/menu",
    icon: <PiBowlFoodFill />,
    roles: ['ADMIN'],
    group: 'carta',
  },
  {
    name: "Usuarios",
    link: "/users",
    icon: <MdPeople />,
    roles: ['ADMIN'],
    group: 'settings',
  },
  {
    name: "Ajustes",
    link: "/settings",
    icon: <MdSettings />,
    roles: ['ADMIN'],
    group: 'settings',
  },
];
