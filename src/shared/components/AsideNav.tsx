import { useEffect, useState } from "react";
import { ItemLink } from "./ItemLink";
import { IoLogOutOutline } from "react-icons/io5";
import { useAuth } from "@/features/auth";
import { useNavigate } from "react-router-dom";
import { HiOutlineChevronRight } from "react-icons/hi";
import { NAV_ITEMS } from "@/shared/config/navigation";

export function AsideNav() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // const toggleExpanded = () => {
  //   setIsExpanded(!isExpanded);
  // };

  const visibleSections = NAV_ITEMS.filter(section => {
    if (!section.roles) return true;
    if (!user?.role) return true;
    return section.roles.includes(user.role);
  });

  return (
    <aside className={`flex flex-col justify-between rounded-xl bg-card-background text-foreground p-3 transition-[width] duration-200 ease-in-out overflow-hidden shrink-0 ${isExpanded ? 'w-52' : 'w-16'}`}>
      <section className="flex flex-col gap-5">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center text-xl py-2 rounded cursor-pointer hover:bg-foreground/50 transition-colors duration-200"
        >
          <HiOutlineChevronRight
            className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
          />
        </button>
        <hr />
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
