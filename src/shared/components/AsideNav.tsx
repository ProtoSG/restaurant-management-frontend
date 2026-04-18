import { useEffect, useState, type ReactNode } from "react";
import { MdDashboard, MdTableBar } from "react-icons/md";
import { ItemLink } from "./ItemLink";
import { IoLogOutOutline } from "react-icons/io5";
import { useAuth } from "@/features/auth";
import { useNavigate } from "react-router-dom";
import { PiBowlFoodFill } from "react-icons/pi";
import { HiOutlineChevronRight } from "react-icons/hi";
import { BiSolidDish } from "react-icons/bi"
import { MdOutlineKitchen } from "react-icons/md"
import type { RoleName } from "@/features/auth/types/Login";

export interface Section {
  name: string;
  link: string;
  icon: ReactNode;
  roles?: RoleName[];
}

const SECTIONS: Section[] = [
  {
    name: "Dashboard",
    link: "/",
    icon: <MdDashboard />,
    roles: ['ADMIN', 'CASHIER']
  },
  {
    name: "Pedidos",
    link: "/orders",
    icon: <BiSolidDish />,
    roles: ['ADMIN', 'CASHIER', 'WAITER']
  },
  {
    name: "Cocina",
    link: "/chef",
    icon: <MdOutlineKitchen />,
    roles: ['ADMIN', 'CHEF']
  },
  {
    name: "Mesas",
    link: "/tables",
    icon: <MdTableBar />,
    roles: ['ADMIN', 'CASHIER', 'WAITER']
  },
  {
    name: "Carta",
    link: "/menu",
    icon: <PiBowlFoodFill />,
    roles: ['ADMIN']
  }
]

export function AsideNav() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const visibleSections = SECTIONS.filter(section => {
    if (!section.roles) return true;
    if (!user?.role) return true;
    return section.roles.includes(user.role);
  });

  return (
    <aside className={`flex flex-col justify-between bg-background text-foreground px-3 py-6 transition-[width] duration-200 ease-in-out overflow-hidden shrink-0 ${isExpanded ? 'w-52' : 'w-16'}`}>
      <section className="flex flex-col gap-5">
        <button
          onClick={toggleExpanded}
          className="flex items-center justify-center text-xl py-2 rounded cursor-pointer hover:bg-foreground/50 transition-colors duration-200"
        >
          <HiOutlineChevronRight
            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
          />
        </button>
        <hr className="" />
        <nav className="flex flex-col gap-2">
          {visibleSections.map(item => (
            <ItemLink key={item.link} item={item} isExpanded={isExpanded} />
          ))}
        </nav>
      </section>
      <button className={`
        flex gap-2 items-center rounded-md bg-white text-black px-2 h-10 cursor-pointer transition-colors
        hover:bg-red
      `}
        onClick={logout}
      >
        <IoLogOutOutline className="rotate-180 text-xl shrink-0" />
        <span
          className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
            isExpanded ? "max-w-24 opacity-100 translate-x-0" : "max-w-0 opacity-0 -translate-x-2"
          }`}
        >
          Salir
        </span>
      </button>
    </aside>
  )
}
