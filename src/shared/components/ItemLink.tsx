import { Link, useLocation } from "react-router-dom";
import type { NavItem } from "@/shared/config/navigation";

interface Props {
  item: NavItem
  isExpanded: boolean
}

export function ItemLink({item, isExpanded}: Props) {

  const location = useLocation();
  const isActive = location.pathname === item.link ? true : false;

  return (
    <Link
      to={item.link}
      key={item.link}
      className={`
        flex items-center pl-2.5 pr-2 gap-2 h-10 rounded-md cursor-pointer transition-colors
        hover:bg-zinc-700
        ${isActive ? "bg-zinc-700" : ""}
      `}
    >
      <span className="text-xl shrink-0 flex items-center justify-center"> {item.icon} </span>
      <span
        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
          isActive ? "font-semibold" : "font-normal"
        } ${isExpanded ? "max-w-40 opacity-100 translate-x-0" : "max-w-0 opacity-0 -translate-x-2"}`}
      >
        {item.name}
      </span>
    </Link>
  )
}
