import { Link, useLocation } from "react-router-dom";
import type { Section } from "./AsideNav";

interface Props {
  item: Section
}

export function ItemLink({item}: Props) {

  const location = useLocation();
  const isActive = location.pathname === item.link ? true : false;

  return (
    <Link
      to={item.link}
      key={item.link}
      className={`
        flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors
        hover:bg-zinc-700
        ${isActive ? "bg-zinc-700" : ""}
      `}
    >
      <span className="text-xl"> {item.icon} </span>
      <span className={`${isActive ? "font-semibold" : "font-normal"}`}> {item.name} </span>
    </Link>
  )
}
